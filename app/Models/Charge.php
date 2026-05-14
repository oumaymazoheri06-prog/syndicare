<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Charge extends Model
{
    use HasFactory;

    protected $fillable = ['amount', 'description', 'date', 'apartment_id', 'status'];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function apartment()
    {
        return $this->belongsTo(Apartment::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
