<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    protected $fillable = ['reference', 'commande_id', 'generee_par', 'date_generation'];
    public function commande()  { return $this->belongsTo(Commande::class); }
    public function generateur(){ return $this->belongsTo(User::class, 'generee_par'); }
}