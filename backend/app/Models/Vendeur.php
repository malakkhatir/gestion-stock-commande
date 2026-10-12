<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Vendeur extends Model
{
    protected $table = 'vendeurs'; // normalement OK, mais on le met pour sécurité
    protected $fillable = ['user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}