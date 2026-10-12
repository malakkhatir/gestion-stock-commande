<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointDeVente extends Model
{
    protected $table = 'point_de_ventes';
    protected $fillable = ['code', 'nom', 'adresse', 'ville_id'];
    public function ville() { return $this->belongsTo(Ville::class); }
    public function commandes() { return $this->hasMany(Commande::class); }
    public function vendeurs() { return $this->hasMany(Vendeur::class); } // si on lie les vendeurs à un point de vente
}