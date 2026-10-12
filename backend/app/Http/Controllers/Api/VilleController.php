<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ville;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VilleController extends Controller
{
    public function index() { return response()->json(Ville::all()); }
    public function show($id) { return response()->json(Ville::findOrFail($id)); }
    public function store(Request $request) {
        $validated = $request->validate([
            'code' => 'required|string|unique:villes',
            'libelle' => 'required|string|unique:villes',
        ]);
        return response()->json(Ville::create($validated), 201);
    }
    public function update(Request $request, $id) {
        $ville = Ville::findOrFail($id);
        $validated = $request->validate([
            'code' => ['required', 'string', Rule::unique('villes')->ignore($ville->id)],
            'libelle' => ['required', 'string', Rule::unique('villes')->ignore($ville->id)],
        ]);
        $ville->update($validated);
        return response()->json($ville);
    }
    public function destroy($id) {
        $ville = Ville::findOrFail($id);
        if ($ville->partenaires()->count() > 0 || $ville->adresseStocks()->count() > 0 || $ville->pointVentes()->count() > 0) {
            return response()->json(['message' => 'Cette ville est utilisée, suppression impossible'], 400);
        }
        $ville->delete();
        return response()->json(null, 204);
    }
}