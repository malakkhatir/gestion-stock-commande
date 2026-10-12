<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Administrateur;
use App\Models\DirecteurVentes;
use App\Models\ResponsableStock;
use App\Models\Vendeur;
use App\Models\Client;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Admin
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => Hash::make('password')]
        );
        Administrateur::firstOrCreate(['user_id' => $user->id]);

        // Directeur
        $user2 = User::firstOrCreate(
            ['email' => 'directeur@example.com'],
            ['name' => 'Directeur', 'password' => Hash::make('password')]
        );
        DirecteurVentes::firstOrCreate(['user_id' => $user2->id]);

        // Responsable stock
        $user3 = User::firstOrCreate(
            ['email' => 'stock@example.com'],
            ['name' => 'RespStock', 'password' => Hash::make('password')]
        );
        ResponsableStock::firstOrCreate(['user_id' => $user3->id]);

        // Vendeur
        $user4 = User::firstOrCreate(
            ['email' => 'vendeur@example.com'],
            ['name' => 'Vendeur', 'password' => Hash::make('password')]
        );
        Vendeur::firstOrCreate(['user_id' => $user4->id]);

        // Client
        $user5 = User::firstOrCreate(
            ['email' => 'client@example.com'],
            ['name' => 'Client', 'password' => Hash::make('password')]
        );
        Client::firstOrCreate(
            ['user_id' => $user5->id],
            [
                'CIN' => 'AB123456',
                'nom' => 'Dupont',
                'telephone' => '0612345678',
                'email' => 'client@example.com',
                'dateCreation' => now(),
                'motDePasse' => Hash::make('password'),
            ]
        );
    }
}