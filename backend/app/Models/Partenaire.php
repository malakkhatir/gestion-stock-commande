<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partenaire extends Model
{
    protected $fillable = ['code', 'type', 'nom', 'contact', 'telephone1', 'telephone2', 'email', 'pays', 'ville_id', 'adresse'];
    public function ville() { return $this->belongsTo(Ville::class); }
    public function materielsFournisseur() { return $this->hasMany(Materiel::class, 'fournisseur_id'); }
    public function materielsFabricant()   { return $this->hasMany(Materiel::class, 'fabricant_id'); }
}