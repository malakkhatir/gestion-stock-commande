<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Materiel extends Model
{
    protected $fillable = [
        'reference', 'nom', 'description', 'type_materiel_id', 'fournisseur_id',
        'fabricant_id', 'prixAchat', 'prixVente', 'prixPromotionnel', 'dateAchat', 'quantiteDisponible',
        'seuil_securite', 'adresse_stock_id'
    ];

    public function type()          { return $this->belongsTo(TypeMateriel::class, 'type_materiel_id'); }
    public function fournisseur()   { return $this->belongsTo(Partenaire::class, 'fournisseur_id'); }
    public function fabricant()     { return $this->belongsTo(Partenaire::class, 'fabricant_id'); }
    public function adresseStock()  { return $this->belongsTo(AdresseStock::class); }
    public function vehicles()      { return $this->belongsToMany(Vehicle::class, 'materiel_vehicle'); }
    public function lignes()        { return $this->hasMany(LigneCommande::class); }
    public function commandes()     { return $this->belongsToMany(Commande::class, 'ligne_commandes')->withPivot('quantite', 'prixHT', 'prixTTC'); }
}