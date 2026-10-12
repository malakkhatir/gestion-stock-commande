<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Materiel;
use App\Models\Partenaire;
use App\Models\TypeMateriel;
use App\Models\AdresseStock;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MaterielController extends Controller
{
    // Liste tous les articles (avec masquage du prix d'achat pour vendeur/client)
    public function index()
    {
        $materiels = Materiel::with(['type', 'fournisseur', 'fabricant', 'adresseStock', 'vehicles'])->get();
        $user = auth()->user();
        if ($user && in_array($user->getRole(), ['vendeur', 'client'])) {
            $materiels->makeHidden(['prixAchat']);
        }
        return response()->json($materiels);
    }

    // Afficher un article
    public function show($id)
    {
        $materiel = Materiel::with(['type', 'fournisseur', 'fabricant', 'adresseStock', 'vehicles'])->findOrFail($id);
        $user = auth()->user();
        if ($user && in_array($user->getRole(), ['vendeur', 'client'])) {
            $materiel->makeHidden(['prixAchat']);
        }
        return response()->json($materiel);
    }

    // Créer un article (admin, directeur, responsable stock)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference' => [
                'required', 'string',
                Rule::unique('materiels')->where(fn ($query) => $query->where('adresse_stock_id', $request->adresse_stock_id)),
            ],
            'nom' => 'required|string',
            'description' => 'nullable|string',
            'type_materiel_id' => 'required|exists:type_materiels,id',
            'fournisseur_id' => 'nullable|exists:partenaires,id',
            'fabricant_id' => 'nullable|exists:partenaires,id',
            'prixAchat' => 'required|numeric|min:0',
            'prixVente' => 'required|numeric|min:0',
            'prixPromotionnel' => [
                'nullable',
                'numeric',
                function ($attribute, $value, $fail) use ($request) {
                    if ($value < ((float) $request->input('prixAchat')) * 1.3) {
                        $fail("Le prix promotionnel doit être supérieur ou égal à 130% du prix d'achat.");
                    }
                    if ($value >= (float) $request->input('prixVente')) {
                        $fail('Le prix promotionnel doit être inférieur au prix de vente.');
                    }
                },
            ],
            'quantiteDisponible' => 'required|integer|min:0',
            'seuil_securite' => 'required|integer|min:0',
            'adresse_stock_id' => 'required|exists:adresse_stocks,id',
            'vehicles' => 'nullable|array',
            'vehicles.*' => 'exists:vehicles,id',
        ]);

        $validated['dateAchat'] = now()->toDateString();
        $materiel = Materiel::create($validated);
        if (isset($validated['vehicles'])) {
            $materiel->vehicles()->sync($validated['vehicles']);
        }
        return response()->json($materiel->load(['type', 'fournisseur', 'fabricant', 'adresseStock', 'vehicles']), 201);
    }

    // Mettre à jour un article
    public function update(Request $request, $id)
    {
        $materiel = Materiel::findOrFail($id);
        $validated = $request->validate([
            'reference' => [
                'required', 'string',
                Rule::unique('materiels')
                    ->where(fn ($query) => $query->where('adresse_stock_id', $request->adresse_stock_id))
                    ->ignore($materiel->id),
            ],
            'nom' => 'required|string',
            'description' => 'nullable|string',
            'type_materiel_id' => 'required|exists:type_materiels,id',
            'fournisseur_id' => 'nullable|exists:partenaires,id',
            'fabricant_id' => 'nullable|exists:partenaires,id',
            'prixAchat' => 'required|numeric|min:0',
            'prixVente' => 'required|numeric|min:0',
            'prixPromotionnel' => [
                'nullable',
                'numeric',
                function ($attribute, $value, $fail) use ($request) {
                    if ($value < ((float) $request->input('prixAchat')) * 1.3) {
                        $fail("Le prix promotionnel doit être supérieur ou égal à 130% du prix d'achat.");
                    }
                    if ($value >= (float) $request->input('prixVente')) {
                        $fail('Le prix promotionnel doit être inférieur au prix de vente.');
                    }
                },
            ],
            'quantiteDisponible' => 'required|integer|min:0',
            'seuil_securite' => 'required|integer|min:0',
            'adresse_stock_id' => 'required|exists:adresse_stocks,id',
            'vehicles' => 'nullable|array',
            'vehicles.*' => 'exists:vehicles,id',
        ]);

        $materiel->update($validated);
        if (isset($validated['vehicles'])) {
            $materiel->vehicles()->sync($validated['vehicles']);
        }
        return response()->json($materiel->load(['type', 'fournisseur', 'fabricant', 'adresseStock', 'vehicles']));
    }

    // Supprimer un article (admin, directeur, responsable stock)
    public function destroy($id)
    {
        $materiel = Materiel::findOrFail($id);
        // Vérifier s'il y a des commandes associées (optionnel)
        if ($materiel->commandes()->count() > 0) {
            return response()->json(['message' => 'Impossible de supprimer un article avec des commandes.'], 400);
        }
        $materiel->vehicles()->detach();
        $materiel->delete();
        return response()->json(null, 204);
    }

    // Transfert de stock entre adresses
    public function transfert(Request $request, $id)
    {
        $materiel = Materiel::findOrFail($id);
        $validated = $request->validate([
            'quantite' => 'required|integer|min:1',
            'adresse_stock_destination_id' => 'required|exists:adresse_stocks,id'
        ]);

        if ($validated['quantite'] > $materiel->quantiteDisponible) {
            return response()->json(['message' => 'Quantité insuffisante'], 400);
        }

        if ($validated['adresse_stock_destination_id'] == $materiel->adresse_stock_id) {
            return response()->json(['message' => "L'adresse de destination doit être différente de l'adresse actuelle"], 400);
        }

        // On soustrait de l'adresse source
        $materiel->quantiteDisponible -= $validated['quantite'];
        $materiel->save();

        // On ajoute à l'adresse destination : soit sur l'article déjà présent là-bas
        // (même référence), soit en créant une nouvelle entrée pour cette adresse.
        $articleDestination = Materiel::where('reference', $materiel->reference)
            ->where('adresse_stock_id', $validated['adresse_stock_destination_id'])
            ->first();

        if ($articleDestination) {
            $articleDestination->quantiteDisponible += $validated['quantite'];
            $articleDestination->save();
        } else {
            $nouvelArticle = $materiel->replicate();
            $nouvelArticle->adresse_stock_id = $validated['adresse_stock_destination_id'];
            $nouvelArticle->quantiteDisponible = $validated['quantite'];
            $nouvelArticle->save();
        }

        return response()->json(['message' => 'Transfert effectué avec succès']);
    }

    // Alertes de stock (seuil de sécurité propre à chaque produit)
    public function alertes()
    {
        $materiels = Materiel::whereColumn('quantiteDisponible', '<=', 'seuil_securite')->get();
        return response()->json($materiels);
    }
}