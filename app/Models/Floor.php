<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Floor extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = ['organization_id', 'number', 'building_id'];

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

   public function apartments()
    {
        return $this->hasManyThrough(Apartment::class, Floor::class);
    }
}
