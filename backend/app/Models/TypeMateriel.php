<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeMateriel extends Model
{
    protected $fillable = ['code', 'libelle'];
    public function materiels() { return $this->hasMany(Materiel::class); }
}