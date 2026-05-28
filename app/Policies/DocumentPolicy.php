<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire', 'Locataire'], true);
    }

    public function view(User $user, Document $document): bool
    {
        if ($user->role === 'Syndic') {
            return true;
        }

        if (! in_array($user->role, ['Coproprietaire', 'Locataire'], true)) {
            return false;
        }

        $targetType = $document->target_type ?: ($document->building_id ? 'building' : 'all');

        return match ($targetType) {
            'all' => true,
            'role' => $document->target_role === $user->role,
            'building' => $document->building_id !== null
                && $user->apartments()
                    ->whereHas('floor', fn ($query) => $query->where('building_id', $document->building_id))
                    ->exists(),
            'apartment' => $document->apartment_id !== null
                && $user->apartments()
                    ->where('apartments.id', $document->apartment_id)
                    ->exists(),
            default => false,
        };
    }

    public function create(User $user): bool
    {
        return $user->role === 'Syndic';
    }

    public function update(User $user, Document $document): bool
    {
        return $user->role === 'Syndic';
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->role === 'Syndic';
    }

    public function restore(User $user, Document $document): bool
    {
        return false;
    }

    public function forceDelete(User $user, Document $document): bool
    {
        return false;
    }
}
