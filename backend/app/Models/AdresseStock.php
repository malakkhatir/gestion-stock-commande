<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdresseStock extends Model
{
    protected $fillable = ['code', 'nom', 'ville_id', 'adresse'];
    public function ville() { return $this->belongsTo(Ville::class); }
    public function materiels() { return $this->hasMany(Materiel::class); }
}
