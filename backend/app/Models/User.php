<?php

namespace App\Models; 

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password'];

    // Relations vers les rôles
    public function administrateur()     { return $this->hasOne(Administrateur::class); }
    public function directeurVentes()    { return $this->hasOne(DirecteurVentes::class); }
    public function responsableStock()   { return $this->hasOne(ResponsableStock::class); }
    public function vendeur()            { return $this->hasOne(Vendeur::class); }

    // Rôle calculé
    public function getRole()
    {
        if ($this->administrateur)       return 'admin';
        if ($this->directeurVentes)      return 'directeur_ventes';
        if ($this->responsableStock)     return 'responsable_stock';
        if ($this->vendeur)              return 'vendeur';
        return null;
    }

    // Relations métier
    public function commandes()          { return $this->hasMany(Commande::class, 'vendeur_id'); }
    public function facturesGenerees()   { return $this->hasMany(Facture::class, 'generee_par'); }
}