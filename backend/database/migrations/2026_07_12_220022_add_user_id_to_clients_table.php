<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
 public function up()
{
    Schema::table('clients', function (Blueprint $table) {
        $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
        // If you prefer without foreign key constraint (simple column):
        // $table->unsignedBigInteger('user_id')->nullable();
    });
}

public function down()
{
    Schema::table('clients', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropColumn('user_id');
    });
}
};
