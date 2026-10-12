<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ligne_commandes', function (Blueprint $table) {
        $table->id();
        $table->foreignId('commande_id')->constrained()->cascadeOnDelete();
        $table->foreignId('materiel_id')->constrained()->cascadeOnDelete();
        $table->integer('quantite');
        $table->decimal('prixHT', 10, 2);
        $table->decimal('prixTTC', 10, 2);
        $table->timestamps();
    });
    }   
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ligne_commandes');
    }
};
