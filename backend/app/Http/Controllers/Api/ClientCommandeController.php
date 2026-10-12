<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\Materiel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientCommandeController extends Controller
{
    public function index(Request $request)
    {
        $commandes = Commande::where('client_id', $request->user()->id)
            ->with(['lignes.materiel', 'vendeur:id,name', 'facture'])
            ->orderByDesc('id')
            ->get();

        return response()->json($commandes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'dateDisponibilite' => 'nullable|date',
            'lignes' => 'required|array|min:1',
            'lignes.*.materiel_id' => 'required|exists:materiels,id',
            'lignes.*.quantite' => 'required|integer|min:1',
        ]);

        $client = $request->user();

        $commande = DB::transaction(function () use ($validated, $client) {
            $adresseStockId = null;
            $lignesData = [];

            foreach ($validated['lignes'] as $ligne) {
                $materiel = Materiel::lockForUpdate()->findOrFail($ligne['materiel_id']);
                if ($ligne['quantite'] > $materiel->quantiteDisponible) {
                    abort(422, "Quantité en stock insuffisante pour « {$materiel->nom} ».");
                }
                if ($adresseStockId === null) {
                    $adresseStockId = $materiel->adresse_stock_id;
                }
                $prixHT = $materiel->prixVente * $ligne['quantite'];
                $lignesData[] = ['materiel' => $materiel, 'quantite' => $ligne['quantite'], 'prixHT' => $prixHT];
            }

            $prixHT = collect($lignesData)->sum('prixHT');

            $commande = Commande::create([
                'client_id' => $client->id,
                'is_nr' => false,
                'client_nom' => null,
                'vendeur_id' => null,
                'adresse_stock_id' => $adresseStockId,
                'dateCommande' => now(),
                'dateDisponibilite' => $validated['dateDisponibilite'] ?? null,
                'prixHT' => $prixHT,
                'prixTTC' => $prixHT * 1.20,
                'statut' => 'en_attente',
            ]);

            foreach ($lignesData as $ligne) {
                LigneCommande::create([
                    'commande_id' => $commande->id,
                    'materiel_id' => $ligne['materiel']->id,
                    'quantite' => $ligne['quantite'],
                    'prixHT' => $ligne['prixHT'],
                    'prixTTC' => $ligne['prixHT'] * 1.20,
                ]);
                $ligne['materiel']->decrement('quantiteDisponible', $ligne['quantite']);
            }

            return $commande;
        });

        return response()->json($commande->load(['lignes.materiel', 'adresseStock']), 201);
    }
}
