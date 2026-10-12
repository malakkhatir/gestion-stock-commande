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
        Schema::table('materiels', function (Blueprint $table) {
            $table->dropUnique('materiels_reference_unique');
            $table->unique(['reference', 'adresse_stock_id'], 'materiels_reference_adresse_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('materiels', function (Blueprint $table) {
            $table->dropUnique('materiels_reference_adresse_unique');
            $table->unique('reference', 'materiels_reference_unique');
        });
    }
};
