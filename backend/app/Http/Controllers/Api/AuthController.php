<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;   // ← IMPORTANT : importer le contrôleur de base
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();
        if ($user && Hash::check($request->password, $user->password)) {
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->getRole(),
                ]
            ]);
        }

        $client = Client::where('email', $request->email)->first();
        if ($client && Hash::check($request->password, $client->motDePasse)) {
            $token = $client->createToken('client_auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $client->id,
                    'name' => $client->nom,
                    'email' => $client->email,
                    'telephone' => $client->telephone,
                    'CIN' => $client->CIN,
                    'role' => 'client',
                ]
            ]);
        }

        throw ValidationException::withMessages([
            'email' => ['Identifiants incorrects.'],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }

    public function user(Request $request)
    {
        $user = $request->user();

        if ($user instanceof Client) {
            return response()->json([
                'id' => $user->id,
                'name' => $user->nom,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'CIN' => $user->CIN,
                'role' => 'client',
            ]);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->getRole(),
        ]);
    }
}