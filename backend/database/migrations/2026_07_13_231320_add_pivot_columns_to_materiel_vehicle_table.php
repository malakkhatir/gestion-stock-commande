<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('materiel_vehicle', function (Blueprint $table) {
            // Ajout des colonnes pivot
            $table->foreignId('materiel_id')->constrained('materiels')->onDelete('cascade');
            $table->foreignId('vehicle_id')->constrained('vehicles')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('materiel_vehicle', function (Blueprint $table) {
            $table->dropForeign(['materiel_id']);
            $table->dropForeign(['vehicle_id']);
            $table->dropColumn(['materiel_id', 'vehicle_id']);
        });
    }
};