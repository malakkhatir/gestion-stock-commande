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
Schema::create('adresse_stocks', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique();
    $table->string('nom');
    $table->foreignId('ville_id')->constrained('villes');
    $table->string('adresse');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adresse_stocks');
    }
};
