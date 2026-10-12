<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Administrateur;
use App\Models\DirecteurVentes;
use App\Models\ResponsableStock;
use App\Models\Vendeur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10); // default 10

        $users = User::with(['administrateur', 'directeurVentes', 'responsableStock', 'vendeur'])
                     ->limit($limit)
                     ->get();

        return response()->json([
            'data' => $users,
            'meta' => ['total' => User::count()],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,directeur_ventes,responsable_stock,vendeur',
        ]);

        $user = DB::transaction(function () use ($validated) {
            $user = User::create(['name' => $validated['name'], 'email' => $validated['email'], 'password' => Hash::make($validated['password'])]);
            $this->syncRole($user, $validated['role']);
            return $user;
        });

        return response()->json($user->load(['administrateur', 'directeurVentes', 'responsableStock', 'vendeur']), 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|in:admin,directeur_ventes,responsable_stock,vendeur',
        ]);

        DB::transaction(function () use ($user, $validated) {
            if (!empty($validated['password'])) $validated['password'] = Hash::make($validated['password']);
            else unset($validated['password']);
            $role = $validated['role'] ?? null;
            unset($validated['role']);
            $user->update($validated);
            if ($role) $this->syncRole($user, $role);
        });

        return response()->json($user->fresh()->load(['administrateur', 'directeurVentes', 'responsableStock', 'vendeur']));
    }

    private function syncRole(User $user, string $role): void
    {
        $user->administrateur()->delete(); $user->directeurVentes()->delete(); $user->responsableStock()->delete(); $user->vendeur()->delete();
        match ($role) {
            'admin' => Administrateur::create(['user_id' => $user->id]),
            'directeur_ventes' => DirecteurVentes::create(['user_id' => $user->id]),
            'responsable_stock' => ResponsableStock::create(['user_id' => $user->id]),
            'vendeur' => Vendeur::create(['user_id' => $user->id]),
        };
    }
}
