<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TypeMateriel;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TypeMaterielController extends Controller
{
    public function index()
    {
        return response()->json(TypeMateriel::all());
    }

    public function show($id)
    {
        return response()->json(TypeMateriel::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:type_materiels',
            'libelle' => 'required|string|unique:type_materiels',
        ]);

        $type = TypeMateriel::create($validated);
        return response()->json($type, 201);
    }

    public function update(Request $request, $id)
    {
        $type = TypeMateriel::findOrFail($id);
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                Rule::unique('type_materiels')->ignore($type->id),
            ],
            'libelle' => [
                'required',
                'string',
                Rule::unique('type_materiels')->ignore($type->id),
            ],
        ]);

        $type->update($validated);
        return response()->json($type);
    }

    public function destroy($id)
    {
        $type = TypeMateriel::findOrFail($id);
        // Vérifier si des articles utilisent ce type
        if ($type->materiels()->count() > 0) {
            return response()->json([
                'message' => 'Ce type est utilisé par des articles, suppression impossible.'
            ], 400);
        }
        $type->delete();
        return response()->json(null, 204);
    }
}