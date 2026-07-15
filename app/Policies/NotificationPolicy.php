<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;

class NotificationPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire', 'Locataire'], true);
    }

    public function view(User $user, Notification $notification): bool
    {
        return $user->role === 'Syndic' || $notification->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'Syndic';
    }

    public function update(User $user, Notification $notification): bool
    {
        return false;
    }

    public function delete(User $user, Notification $notification): bool
    {
        return $user->role === 'Syndic';
    }

    public function markRead(User $user, Notification $notification): bool
    {
        return $notification->user_id === $user->id;
    }

    public function restore(User $user, Notification $notification): bool
    {
        return false;
    }

    public function forceDelete(User $user, Notification $notification): bool
    {
        return false;
    }
}
