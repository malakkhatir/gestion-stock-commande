<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    protected $fillable = [
        'client_id', 'is_nr', 'client_nom',
        'vendeur_id', 'adresse_stock_id', 'dateCommande', 'dateAchat',
        'dateDisponibilite', 'prixHT', 'prixTTC', 'statut'
    ];

    public function client()
      {
        return $this->belongsTo(Client::class);
      }
    public function vendeur()
    { 
        return $this->belongsTo(User::class, 'vendeur_id'); 
    }
    public function adresseStock()
    { 
        return $this->belongsTo(AdresseStock::class);
    }
    public function facture()    
     { 
        return $this->hasOne(Facture::class);
    }
    public function lignes()  
        {
             return $this->hasMany(LigneCommande::class);
        }
}
