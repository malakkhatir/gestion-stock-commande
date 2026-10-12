<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ville extends Model
{
    protected $fillable = [
        'code',
        'libelle',
    ];

    public function adresseStocks() { return $this->hasMany(AdresseStock::class); }
    public function partenaires()   { return $this->hasMany(Partenaire::class); }
    public function pointVentes()   { return $this->hasMany(PointDeVente::class); }
}
