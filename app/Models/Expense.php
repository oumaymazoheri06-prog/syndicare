<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = ['amount', 'description', 'date', 'building_id'];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }
}
