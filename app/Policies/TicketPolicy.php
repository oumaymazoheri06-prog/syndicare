<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire', 'Locataire'], true);
    }

    public function view(User $user, Ticket $ticket): bool
    {
        if ($user->role === 'Syndic') {
            return true;
        }

        return $ticket->assingned_by === $user->id
            || $ticket->assigned_to === $user->id
            || $ticket->apartment?->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['Coproprietaire', 'Locataire'], true);
    }

    public function update(User $user, Ticket $ticket): bool
    {
        return $user->role === 'Syndic'
            || ($ticket->assingned_by === $user->id && $ticket->status === 'open');
    }

    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->role === 'Syndic';
    }

    public function restore(User $user, Ticket $ticket): bool
    {
        return false;
    }

    public function forceDelete(User $user, Ticket $ticket): bool
    {
        return false;
    }
}
