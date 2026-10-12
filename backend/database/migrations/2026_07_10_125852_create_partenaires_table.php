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
Schema::create('partenaires', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique();
    $table->enum('type', ['fournisseur', 'fabricant']);
    $table->string('nom');
    $table->string('contact')->nullable();
    $table->string('telephone1');
    $table->string('telephone2')->nullable();
    $table->string('email')->nullable();
    $table->string('pays');
    $table->foreignId('ville_id')->constrained('villes')->onDelete('restrict');
    $table->string('adresse');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partenaires');
    }
};
