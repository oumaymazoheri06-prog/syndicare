<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = ['organization_id', 'file_path', 'payment_id'];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
