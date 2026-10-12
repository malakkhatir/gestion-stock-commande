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
Schema::create('commandes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->nullable()->constrained('clients');
    $table->boolean('is_nr')->default(false); // si client non renseigné
    $table->string('client_nom')->nullable(); // si NR
   $table->foreignId('vendeur_id')->constrained('users'); // l'utilisateur vendeur
    $table->foreignId('point_vente_id')->constrained('point_ventes');
    $table->dateTime('dateCommande');
    $table->dateTime('dateAchat')->nullable();
    $table->date('dateDisponibilite')->nullable();
    $table->decimal('prixHT', 10, 2);
    $table->decimal('prixTTC', 10, 2);
    $table->enum('statut', ['en_attente', 'disponible', 'retiree', 'annulee'])->default('en_attente');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
