<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Audit_log extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = ['organization_id', 'action', 'details', 'performed_by'];

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
