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
Schema::create('materiels', function (Blueprint $table) {
    $table->id();
    $table->string('reference')->unique();
    $table->string('nom');
    $table->text('description')->nullable();
    $table->foreignId('type_materiel_id')->constrained('type_materiels');
    $table->foreignId('fournisseur_id')->constrained('partenaires'); // on suppose un fournisseur
    $table->foreignId('fabricant_id')->nullable()->constrained('partenaires');
    $table->decimal('prixAchat', 10, 2);
    $table->decimal('prixVente', 10, 2);
    $table->date('dateAchat')->nullable();
    $table->integer('quantiteDisponible')->default(0);
    $table->foreignId('adresse_stock_id')->constrained('adresse_stocks');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materiels');
    }
};
