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
Schema::create('clients', function (Blueprint $table) {
    $table->id();
    $table->string('CIN')->unique();
    $table->string('nom');
    $table->string('telephone');
    $table->string('email')->unique();
    $table->date('dateCreation');
    $table->string('motDePasse'); // stocké hashé
    // optionnel : adresse
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
