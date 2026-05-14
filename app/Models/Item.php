<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'category',
        'description',
        'date',
        'type',
        'status',
        'location',
        'image_path',
        'user_id',
        'apartment_id',
        'resolved_at',
    ];

    protected $casts = [
        'date' => 'date',
        'resolved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function apartment()
    {
        return $this->belongsTo(Apartment::class);
    }

    public function claims()
    {
        return $this->hasMany(ItemClaim::class);
    }
}
