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
Schema::create('point_ventes', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique();
    $table->string('nom');
    $table->string('adresse');
    $table->foreignId('ville_id')->constrained('villes');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_de_ventes');
    }
};
