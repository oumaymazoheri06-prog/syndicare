<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire'], true);
    }

    public function view(User $user, Payment $payment): bool
    {
        if ($user->role === 'Syndic') {
            return true;
        }

        return $payment->charge?->apartment?->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire'], true);
    }

    public function update(User $user, Payment $payment): bool
    {
        return $user->role === 'Syndic';
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $user->role === 'Syndic';
    }

    public function restore(User $user, Payment $payment): bool
    {
        return false;
    }

    public function forceDelete(User $user, Payment $payment): bool
    {
        return false;
    }
}
