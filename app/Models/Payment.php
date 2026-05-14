<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = ['amount', 'charge_id', 'status', 'payment_date'];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function receipt()
    {
        return $this->hasOne(Receipt::class);
    }

    public function charge()
    {
        return $this->belongsTo(Charge::class);
    }
}
