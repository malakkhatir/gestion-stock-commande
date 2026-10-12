<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneCommande extends Model
{
    protected $fillable = [
        'commande_id',
        'materiel_id',
        'quantite',
        'prixHT',
        'prixTTC',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function materiel()
    {
        return $this->belongsTo(Materiel::class);
    }
}
