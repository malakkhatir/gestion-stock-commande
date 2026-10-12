<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdresseStock;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdresseStockController extends Controller
{
    public function index()
    {
        return response()->json(AdresseStock::with('ville')->get());
    }

    public function show($id)
    {
        return response()->json(AdresseStock::with('ville')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'      => 'required|string|unique:adresse_stocks',
            'nom'       => 'required|string',
            'ville_id'  => 'required|exists:villes,id',
            'adresse'   => 'required|string',
        ]);

        $adresse = AdresseStock::create($validated);
        return response()->json($adresse->load('ville'), 201);
    }

    public function update(Request $request, $id)
    {
        $adresse = AdresseStock::findOrFail($id);
        $validated = $request->validate([
            'code' => [
                'sometimes',
                'string',
                Rule::unique('adresse_stocks')->ignore($adresse->id),
            ],
            'nom'       => 'sometimes|string',
            'ville_id'  => 'sometimes|exists:villes,id',
            'adresse'   => 'sometimes|string',
        ]);

        $adresse->update($validated);
        return response()->json($adresse->load('ville'));
    }

    public function destroy($id)
    {
        $adresse = AdresseStock::findOrFail($id);
        if ($adresse->materiels()->count() > 0) {
            return response()->json([
                'message' => 'Cette adresse de stockage est utilisée par des articles, suppression impossible.'
            ], 400);
        }
        $adresse->delete();
        return response()->json(null, 204);
    }
}