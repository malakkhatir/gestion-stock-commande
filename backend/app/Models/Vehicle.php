<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['marque', 'modele', 'annee'];

    // Relation Many-to-Many avec Materiel (compatibilité)
    public function materiels()
    {
        return $this->belongsToMany(Materiel::class, 'materiel_vehicle');
    }
}