<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;

class ExpensePolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire'], true);
    }

    public function view(User $user, Expense $expense): bool
    {
        if ($user->role === 'Syndic') {
            return true;
        }

        if ($user->role !== 'Coproprietaire') {
            return false;
        }

        if ($expense->apartment_id) {
            return $user->apartments()
                ->whereKey($expense->apartment_id)
                ->exists();
        }

        return $user->apartments()
            ->whereHas('floor', fn ($query) => $query->where('building_id', $expense->building_id))
            ->exists();
    }

    public function create(User $user): bool
    {
        return $user->role === 'Syndic';
    }

    public function update(User $user, Expense $expense): bool
    {
        return $user->role === 'Syndic';
    }

    public function delete(User $user, Expense $expense): bool
    {
        return $user->role === 'Syndic';
    }

    public function restore(User $user, Expense $expense): bool
    {
        return false;
    }

    public function forceDelete(User $user, Expense $expense): bool
    {
        return false;
    }
}
