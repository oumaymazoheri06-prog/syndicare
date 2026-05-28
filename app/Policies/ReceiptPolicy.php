<?php

namespace App\Policies;

use App\Models\Receipt;
use App\Models\User;

class ReceiptPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire', 'Locataire'], true);
    }

    public function view(User $user, Receipt $receipt): bool
    {
        if ($user->role === 'Syndic') {
            return true;
        }

        return $receipt->payment?->charge?->apartment?->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'Syndic';
    }

    public function update(User $user, Receipt $receipt): bool
    {
        return $user->role === 'Syndic';
    }

    public function delete(User $user, Receipt $receipt): bool
    {
        return $user->role === 'Syndic';
    }

    public function restore(User $user, Receipt $receipt): bool
    {
        return false;
    }

    public function forceDelete(User $user, Receipt $receipt): bool
    {
        return false;
    }
}
