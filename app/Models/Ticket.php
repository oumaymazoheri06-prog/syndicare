<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'apartment_id', 'assingned_by', 'assigned_to', 'status'];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'assingned_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function ticketMessages()
    {
        return $this->hasMany(Ticket_message::class);
    }
public function apartment()
    {
        return $this->belongsTo(Apartment::class);
    }
}
