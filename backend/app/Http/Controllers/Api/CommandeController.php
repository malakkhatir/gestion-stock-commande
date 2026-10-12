<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\Materiel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);
        $search = trim((string) $request->input('search', ''));

        $commandes = Commande::with(['client:id,nom', 'lignes.materiel:id,nom,type_materiel_id', 'lignes.materiel.type:id,libelle', 'vendeur:id,name', 'adresseStock:id,nom', 'facture'])
            ->when($this->estVendeur(), fn ($query) => $query->where(
                fn ($q) => $q->where('vendeur_id', auth()->id())->orWhereNull('vendeur_id')
            ))
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->input('statut')))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('id', 'like', "%{$search}%")
                        ->orWhere('client_nom', 'like', "%{$search}%")
                        ->orWhereHas('client', fn ($client) => $client->where('nom', 'like', "%{$search}%"))
                        ->orWhereHas('lignes.materiel', fn ($materiel) => $materiel->where('nom', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json($commandes);
    }

    
    public function show($id)
    {
        return response()->json(Commande::with(['client', 'vendeur', 'adresseStock', 'lignes.materiel', 'facture'])->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'is_nr' => 'required|boolean',
            'client_nom' => 'required_if:is_nr,true|nullable|string',
            'dateCommande' => 'required|date',
            'dateDisponibilite' => 'nullable|date',
            'lignes' => 'required|array|min:1',
            'lignes.*.materiel_id' => 'required|exists:materiels,id',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.prixHT' => 'required|numeric|min:0',
        ]);

        $commande = DB::transaction(function () use ($validated) {
            $materiels = [];
            $adresseStockId = null;
            foreach ($validated['lignes'] as $ligne) {
                $materiel = Materiel::lockForUpdate()->findOrFail($ligne['materiel_id']);
                if ($ligne['quantite'] > $materiel->quantiteDisponible) {
                    abort(422, "Quantité en stock insuffisante pour « {$materiel->nom} ».");
                }
                if ($adresseStockId === null) {
                    $adresseStockId = $materiel->adresse_stock_id;
                }
                $materiels[] = $materiel;
            }

            $prixHT = collect($validated['lignes'])->sum('prixHT');

            $commande = Commande::create([
                'client_id' => $validated['client_id'] ?? null,
                'is_nr' => $validated['is_nr'],
                'client_nom' => $validated['is_nr'] ? $validated['client_nom'] : null,
                'vendeur_id' => auth()->id(),
                'adresse_stock_id' => $adresseStockId,
                'dateCommande' => $validated['dateCommande'],
                'dateDisponibilite' => $validated['dateDisponibilite'] ?? null,
                'prixHT' => $prixHT,
                'prixTTC' => $prixHT * 1.20,
                'statut' => 'en_attente',
            ]);

            foreach ($validated['lignes'] as $index => $ligne) {
                $materiel = $materiels[$index];
                LigneCommande::create([
                    'commande_id' => $commande->id,
                    'materiel_id' => $materiel->id,
                    'quantite' => $ligne['quantite'],
                    'prixHT' => $ligne['prixHT'],
                    'prixTTC' => $ligne['prixHT'] * 1.20,
                ]);
                $materiel->decrement('quantiteDisponible', $ligne['quantite']);
            }

            return $commande;
        });

        return response()->json(
            $commande->load(['client', 'lignes.materiel', 'vendeur', 'adresseStock']),
            201
        );
    }

    public function valider($id)
    {
        $result = DB::transaction(function () use ($id) {
            $commande = Commande::with('facture')->lockForUpdate()->findOrFail($id);
            $this->assertProprietaire($commande);
            if ($commande->statut === 'annulee') {
                abort(422, 'Cette commande est annulée.');
            }
            if ($commande->statut === 'retiree') {
                abort(422, 'Cette commande est déjà validée.');
            }

            $updates = ['statut' => 'retiree', 'dateAchat' => now()];
            if ($commande->vendeur_id === null && $this->estVendeur()) {
                $updates['vendeur_id'] = auth()->id();
            }
            $commande->update($updates);
            $facture = $commande->facture ?? (new FactureController())->genererFacture($commande);
            return compact('commande', 'facture');
        });

        return response()->json([
            'message' => 'Commande validée et facture générée.',
            'commande' => $result['commande']->load(['client', 'lignes.materiel', 'facture']),
            'facture' => $result['facture'],
        ]);
    }

    public function annuler($id)
    {
        $commande = DB::transaction(function () use ($id) {
            $commande = Commande::with('lignes')->lockForUpdate()->findOrFail($id);
            $this->assertProprietaire($commande);
            if ($commande->statut === 'retiree') {
                abort(422, 'Impossible d’annuler une commande déjà validée.');
            }
            if ($commande->statut === 'annulee') {
                abort(422, 'Cette commande est déjà annulée.');
            }

            foreach ($commande->lignes as $ligne) {
                $materiel = Materiel::lockForUpdate()->findOrFail($ligne->materiel_id);
                $materiel->increment('quantiteDisponible', $ligne->quantite);
            }
            $commande->update(['statut' => 'annulee']);
            return $commande;
        });

        return response()->json([
            'message' => 'Commande annulée et stock remis à jour.',
            'commande' => $commande->load(['client', 'lignes.materiel']),
        ]);
    }

    private function estVendeur(): bool
    {
        return auth()->user()?->getRole() === 'vendeur';
    }

    private function assertProprietaire(Commande $commande): void
    {
        if ($this->estVendeur() && $commande->vendeur_id !== null && $commande->vendeur_id !== auth()->id()) {
            abort(403, 'Vous ne pouvez agir que sur vos propres commandes.');
        }
    }
}
