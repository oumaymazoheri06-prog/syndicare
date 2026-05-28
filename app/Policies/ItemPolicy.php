<?php

namespace App\Policies;

use App\Models\Item;
use App\Models\User;

class ItemPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire', 'Locataire'], true);
    }

    public function view(User $user, Item $item): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire', 'Locataire'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire', 'Locataire'], true);
    }

    public function update(User $user, Item $item): bool
    {
        return $user->role === 'Syndic' || $item->user_id === $user->id;
    }

    public function delete(User $user, Item $item): bool
    {
        return $user->role === 'Syndic' || $item->user_id === $user->id;
    }

    public function claim(User $user, Item $item): bool
    {
        return $item->user_id !== $user->id;
    }

    public function restore(User $user, Item $item): bool
    {
        return false;
    }

    public function forceDelete(User $user, Item $item): bool
    {
        return false;
    }
}
