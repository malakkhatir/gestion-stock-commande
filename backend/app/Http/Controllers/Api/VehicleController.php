<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    public function index()
    {
        return response()->json(Vehicle::all());
    }

    public function show($id)
    {
        return response()->json(Vehicle::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'marque' => 'required|string',
            'modele' => 'required|string',
            'annee'  => 'nullable|integer|min:1900|max:' . date('Y'),
        ]);

        $vehicle = Vehicle::create($validated);
        return response()->json($vehicle, 201);
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $validated = $request->validate([
            'marque' => 'sometimes|string',
            'modele' => 'sometimes|string',
            'annee'  => 'nullable|integer|min:1900|max:' . date('Y'),
        ]);

        $vehicle->update($validated);
        return response()->json($vehicle);
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        // Vérifier s'il est lié à des articles
        if ($vehicle->materiels()->count() > 0) {
            return response()->json([
                'message' => 'Ce véhicule est associé à des articles, suppression impossible.'
            ], 400);
        }
        $vehicle->delete();
        return response()->json(null, 204);
    }
}