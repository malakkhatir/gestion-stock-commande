<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ClientController extends Controller
{
    public function index()
    {
        return response()->json(Client::all());
    }

    public function show($id)
    {
        return response()->json(Client::with('commandes')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'CIN' => 'required|string|unique:clients',
            'nom' => 'required|string',
            'telephone' => 'required|string',
            'email' => 'required|email|unique:clients',
            'motDePasse' => 'required|string|min:6',
        ]);

        $validated['dateCreation'] = now()->toDateString();
        $validated['motDePasse'] = Hash::make($validated['motDePasse']);
        $client = Client::create($validated);
        return response()->json($client, 201);
    }

    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        $validated = $request->validate([
            'CIN' => 'sometimes|string|unique:clients,CIN,'.$client->id,
            'nom' => 'sometimes|string',
            'telephone' => 'sometimes|string',
            'email' => 'sometimes|email|unique:clients,email,'.$client->id,
            'dateCreation' => 'sometimes|date',
            'motDePasse' => 'sometimes|string|min:6',
        ]);

        if (isset($validated['motDePasse'])) {
            $validated['motDePasse'] = Hash::make($validated['motDePasse']);
        }

        $client->update($validated);
        return response()->json($client);
    }

    public function destroy($id)
    {
        $client = Client::findOrFail($id);
        if ($client->commandes()->count() > 0) {
            return response()->json(['message' => 'Ce client a des commandes, suppression impossible'], 400);
        }
        $client->delete();
        return response()->json(null, 204);
    }
}