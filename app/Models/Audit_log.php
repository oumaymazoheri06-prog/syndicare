<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Audit_log extends Model
{
    use HasFactory;

    protected $fillable = ['action', 'details', 'performed_by'];

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
