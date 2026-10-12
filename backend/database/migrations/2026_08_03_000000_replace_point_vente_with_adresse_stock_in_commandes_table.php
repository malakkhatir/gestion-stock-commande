<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropForeign(['point_vente_id']);
            $table->renameColumn('point_vente_id', 'adresse_stock_id');
        });

        Schema::table('commandes', function (Blueprint $table) {
            $table->foreign('adresse_stock_id')->references('id')->on('adresse_stocks');
        });
    }

    public function down(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropForeign(['adresse_stock_id']);
            $table->renameColumn('adresse_stock_id', 'point_vente_id');
        });

        Schema::table('commandes', function (Blueprint $table) {
            $table->foreign('point_vente_id')->references('id')->on('point_de_ventes');
        });
    }
};
