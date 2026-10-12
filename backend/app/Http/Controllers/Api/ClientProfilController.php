<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ClientProfilController extends Controller
{
    public function update(Request $request)
    {
        $client = $request->user();

        $validated = $request->validate([
            'nom' => 'sometimes|string',
            'telephone' => 'sometimes|string',
            'email' => 'sometimes|email|unique:clients,email,'.$client->id,
            'motDePasse' => 'sometimes|string|min:6',
        ]);

        if (isset($validated['motDePasse'])) {
            $validated['motDePasse'] = Hash::make($validated['motDePasse']);
        }

        $client->update($validated);

        return response()->json([
            'id' => $client->id,
            'name' => $client->nom,
            'email' => $client->email,
            'telephone' => $client->telephone,
            'CIN' => $client->CIN,
            'role' => 'client',
        ]);
    }
}
