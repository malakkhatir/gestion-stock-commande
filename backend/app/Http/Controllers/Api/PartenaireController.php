<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partenaire;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PartenaireController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Partenaire::with('ville')
                ->when($request->filled('type'), fn ($query) => $query->where('type', $request->input('type')))
                ->get()
        );
    }

    public function show($id)
    {
        return response()->json(Partenaire::with('ville')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:partenaires',
            'type' => ['required', Rule::in(['fournisseur', 'fabricant'])],
            'nom' => 'required|string',
            'contact' => 'nullable|string',
            'telephone1' => 'required|string',
            'telephone2' => 'nullable|string',
            'email' => 'nullable|email',
            'pays' => 'required|string',
            'ville_id' => 'required|exists:villes,id',
            'adresse' => 'required|string',
        ]);

        $partenaire = Partenaire::create($validated);
        return response()->json($partenaire->load('ville'), 201);
    }

    public function update(Request $request, $id)
    {
        $partenaire = Partenaire::findOrFail($id);
        $validated = $request->validate([
            'code' => ['sometimes','string', Rule::unique('partenaires')->ignore($partenaire->id)],
            'type' => ['sometimes', Rule::in(['fournisseur', 'fabricant'])],
            'nom' => 'sometimes|string',
            'contact' => 'nullable|string',
            'telephone1' => 'sometimes|string',
            'telephone2' => 'nullable|string',
            'email' => 'nullable|email',
            'pays' => 'sometimes|string',
            'ville_id' => 'sometimes|exists:villes,id',
            'adresse' => 'sometimes|string',
        ]);

        $partenaire->update($validated);
        return response()->json($partenaire->load('ville'));
    }

    public function destroy($id)
    {
        $partenaire = Partenaire::findOrFail($id);
        if ($partenaire->materielsFournisseur()->count() > 0 || $partenaire->materielsFabricant()->count() > 0) {
            return response()->json(['message' => 'Ce partenaire est lié à des articles, suppression impossible'], 400);
        }
        $partenaire->delete();
        return response()->json(null, 204);
    }
}