<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = [
        'organization_id',
        'title',
        'file_path',
        'category',
        'target_type',
        'building_id',
        'building_ids',
        'apartment_id',
        'target_role',
        'uploaded_by',
    ];

    protected $casts = [
        'building_ids' => 'array',
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function building()
    {
        return $this->belongsTo(Building::class);
    }

    public function apartment()
    {
        return $this->belongsTo(Apartment::class);
    }
}
