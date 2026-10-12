<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Administrateur extends Model
{
    protected $table = 'administrateurs'; // identique à celui par défaut
    protected $fillable = ['user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}