<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Apartment extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = ['organization_id', 'number', 'floor_id', 'user_id', 'area'];

    public function floor()
    {
        return $this->belongsTo(Floor::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function charges()
    {
        return $this->hasMany(Charge::class);
    }
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
    public function items()
    {
        return $this->hasMany(Item::class);
    }
    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
      public function payments()
    {
        return $this->hasManyThrough(Payment::class, Charge::class);
    }

}
