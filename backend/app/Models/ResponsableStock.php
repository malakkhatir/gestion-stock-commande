<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ResponsableStock extends Model
{
    protected $table = 'responsables_stock'; // ici aussi
    protected $fillable = ['user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}