<?php
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Pattern: building.{buildingId|'all'}.{role|'all'}
Broadcast::channel('building.{buildingId}.{role}', function (User $user, string $buildingId, string $role) {
    $roleMatch = $role === 'all' || $user->role === $role;

    $buildingMatch = $buildingId === 'all' || $user->apartments()
        ->whereHas('floor', fn ($query) => $query->where('building_id', (int) $buildingId))
        ->exists();

    return $roleMatch && $buildingMatch;
});
