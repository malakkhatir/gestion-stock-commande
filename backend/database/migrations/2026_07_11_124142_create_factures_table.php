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
Schema::create('factures', function (Blueprint $table) {
    $table->id();
    $table->string('reference')->unique();
    $table->foreignId('commande_id')->constrained('commandes');
    $table->foreignId('generee_par')->constrained('users'); // admin ou vendeur
    $table->dateTime('date_generation');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
