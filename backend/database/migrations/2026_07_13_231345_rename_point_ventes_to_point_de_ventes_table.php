<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::rename('point_ventes', 'point_de_ventes');
    }

    public function down()
    {
        Schema::rename('point_de_ventes', 'point_ventes');
    }
};