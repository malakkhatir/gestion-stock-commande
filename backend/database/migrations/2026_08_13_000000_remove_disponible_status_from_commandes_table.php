<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('commandes')->where('statut', 'disponible')->update(['statut' => 'en_attente']);
        DB::statement("ALTER TABLE commandes MODIFY statut ENUM('en_attente', 'retiree', 'annulee') NOT NULL DEFAULT 'en_attente'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE commandes MODIFY statut ENUM('en_attente', 'disponible', 'retiree', 'annulee') NOT NULL DEFAULT 'en_attente'");
    }
};
