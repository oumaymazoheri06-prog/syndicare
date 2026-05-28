<?php

namespace App\Policies;

use App\Models\Ticket_message;
use App\Models\User;

class Ticket_messagePolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire', 'Locataire'], true);
    }

    public function view(User $user, Ticket_message $ticketMessage): bool
    {
        if ($user->role === 'Syndic') {
            return true;
        }

        return $ticketMessage->sender_id === $user->id
            || $ticketMessage->ticket?->assingned_by === $user->id
            || $ticketMessage->ticket?->assigned_to === $user->id
            || $ticketMessage->ticket?->apartment?->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire', 'Locataire'], true);
    }

    public function update(User $user, Ticket_message $ticketMessage): bool
    {
        return $user->role === 'Syndic' || $ticketMessage->sender_id === $user->id;
    }

    public function delete(User $user, Ticket_message $ticketMessage): bool
    {
        return $user->role === 'Syndic' || $ticketMessage->sender_id === $user->id;
    }

    public function restore(User $user, Ticket_message $ticketMessage): bool
    {
        return false;
    }

    public function forceDelete(User $user, Ticket_message $ticketMessage): bool
    {
        return false;
    }
}
