<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class DirecteurVentes extends Model
{
    protected $table = 'directeurs_ventes'; // attention : nom exact de votre table
    protected $fillable = ['user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}