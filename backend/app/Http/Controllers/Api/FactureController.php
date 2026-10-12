<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Models\Commande;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Exception;

class FactureController extends Controller
{
    // Générer une facture (appelée par le contrôleur Commande)
    public function genererFacture(Commande $commande)
    {
        $facture = Facture::create([
            'reference' => 'FAC-' . strtoupper(Str::random(8)),
            'commande_id' => $commande->id,
            'generee_par' => auth()->id() ?? 1, // fallback admin
            'date_generation' => now(),
        ]);
        return $facture;
    }

    // Afficher toutes les factures
    public function index()
    {
        $factures = Facture::with(['commande.client', 'commande.lignes.materiel', 'generateur'])
            ->when($this->estVendeur(), fn ($query) => $query->whereHas('commande', fn ($c) => $c->where('vendeur_id', auth()->id())))
            ->get();
        return response()->json($factures);
    }

    // Afficher une facture
    public function show($id)
    {
        $facture = Facture::with(['commande.client', 'commande.lignes.materiel', 'generateur'])->findOrFail($id);
        $this->assertProprietaire($facture);
        return response()->json($facture);
    }

    // Créer une facture manuellement (admin ou vendeur) – on utilise la même méthode store
    public function store(Request $request)
    {
        $validated = $request->validate([
            'commande_id' => 'required|exists:commandes,id',
        ]);

        $commande = Commande::findOrFail($validated['commande_id']);
        if ($commande->statut !== 'retiree') {
            return response()->json(['message' => 'La commande doit être validée avant de générer une facture'], 400);
        }

        // Vérifier si une facture existe déjà
        if ($commande->facture) {
            return response()->json(['message' => 'Une facture existe déjà pour cette commande'], 400);
        }

        $facture = $this->genererFacture($commande);
        return response()->json($facture, 201);
    }

    public function update(Request $request, $id)
    {
        $facture = Facture::findOrFail($id);
        $validated = $request->validate([
            'reference' => 'sometimes|string|unique:factures,reference,'.$facture->id,
            'date_generation' => 'sometimes|date',
        ]);
        $facture->update($validated);
        return response()->json($facture->load(['commande.client', 'commande.lignes.materiel', 'generateur']));
    }

    public function pdf($id)
    {
        $facture = Facture::with(['commande.client', 'commande.lignes.materiel', 'commande.adresseStock', 'generateur'])->findOrFail($id);
        $this->assertProprietaire($facture);

        if ($facture->commande?->statut !== 'retiree') {
            return response()->json([
                'message' => 'Impossible de générer le PDF : la commande est en attente.'
            ], 400);
        }

        try {
            // Convertir date_generation en objet Carbon si c'est une chaîne
            if (is_string($facture->date_generation)) {
                $facture->date_generation = \Carbon\Carbon::parse($facture->date_generation);
            }

            $pdf = Pdf::loadView('factures.ticket', compact('facture'));
            return $pdf->download('facture-'.$facture->reference.'.pdf');
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Erreur PDF : ' . $e->getMessage()
            ], 500);
        }
    }

    private function estVendeur(): bool
    {
        return auth()->user()?->getRole() === 'vendeur';
    }

    private function assertProprietaire(Facture $facture): void
    {
        if ($this->estVendeur() && $facture->commande?->vendeur_id !== auth()->id()) {
            abort(403, 'Vous ne pouvez consulter que vos propres factures.');
        }
    }
}
