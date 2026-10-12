<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PointDeVente;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PointDeVenteController extends Controller
{
    public function index()
    {
        return response()->json(PointDeVente::with('ville')->get());
    }

    public function show($id)
    {
        return response()->json(PointDeVente::with('ville')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'      => 'required|string|unique:point_de_ventes',
            'nom'       => 'required|string',
            'adresse'   => 'required|string',
            'ville_id'  => 'required|exists:villes,id',
        ]);

        $point = PointDeVente::create($validated);
        return response()->json($point->load('ville'), 201);
    }

    public function update(Request $request, $id)
    {
        $point = PointDeVente::findOrFail($id);
        $validated = $request->validate([
            'code' => [
                'sometimes',
                'string',
                Rule::unique('point_de_ventes')->ignore($point->id),
            ],
            'nom'       => 'sometimes|string',
            'adresse'   => 'sometimes|string',
            'ville_id'  => 'sometimes|exists:villes,id',
        ]);

        $point->update($validated);
        return response()->json($point->load('ville'));
    }

    public function destroy($id)
    {
        $point = PointDeVente::findOrFail($id);
        if ($point->commandes()->count() > 0) {
            return response()->json([
                'message' => 'Ce point de vente est associé à des commandes, suppression impossible.'
            ], 400);
        }
        $point->delete();
        return response()->json(null, 204);
    }
}