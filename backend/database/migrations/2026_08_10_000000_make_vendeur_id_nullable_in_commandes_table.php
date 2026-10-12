<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropForeign(['vendeur_id']);
        });

        DB::statement('ALTER TABLE commandes MODIFY vendeur_id BIGINT UNSIGNED NULL');

        Schema::table('commandes', function (Blueprint $table) {
            $table->foreign('vendeur_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropForeign(['vendeur_id']);
        });

        DB::statement('ALTER TABLE commandes MODIFY vendeur_id BIGINT UNSIGNED NOT NULL');

        Schema::table('commandes', function (Blueprint $table) {
            $table->foreign('vendeur_id')->references('id')->on('users');
        });
    }
};
