<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket_message extends Model
{
    use HasFactory;

    protected $fillable = ['message', 'ticket_id', 'sender_id'];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
