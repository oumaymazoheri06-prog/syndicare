<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Building extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'address'];

    public function floors()
    {
        return $this->hasMany(Floor::class);
    }

    public function apartments()
    {
        return $this->hasManyThrough(Apartment::class, Floor::class, 'building_id', 'floor_id', 'id', 'id');
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function charges()
    {
        return $this->hasMany(Charge::class);
    }
}
