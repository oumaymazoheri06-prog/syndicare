<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = ['organization_id', 'amount', 'description', 'date', 'building_id'];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }
}
