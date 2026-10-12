<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Client extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['CIN', 'nom', 'telephone', 'email', 'dateCreation', 'motDePasse', 'user_id'];
    protected $hidden = ['motDePasse'];

    public function commandes() { return $this->hasMany(Commande::class); }
    public function factures() { return $this->hasManyThrough(Facture::class, Commande::class); }

    public function getAuthPassword()
    {
        return $this->motDePasse;
    }

    public function getRole(): ?string
    {
        return null;
    }
}
