<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = [
        'organization_id',
        'amount',
        'charge_id',
        'user_id',
        'status',
        'payment_date',
        'method',
        'payment_proof',
    ];

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
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
