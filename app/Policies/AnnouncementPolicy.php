<?php

namespace App\Policies;

use App\Models\Announcement;
use App\Models\User;

class AnnouncementPolicy
{
    private const TARGET_COPROPRIETAIRES = ['coproprietaires', 'copropriétaires'];

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['Syndic', 'Coproprietaire', 'Locataire'], true);
    }

    public function view(User $user, Announcement $announcement): bool
    {
        if ($user->role === 'Syndic') {
            return true;
        }

        return $this->matchesRole($user, $announcement)
            && $this->matchesBuilding($user, $announcement);
    }

    public function create(User $user): bool
    {
        return $user->role === 'Syndic';
    }

    public function update(User $user, Announcement $announcement): bool
    {
        return $user->role === 'Syndic';
    }

    public function delete(User $user, Announcement $announcement): bool
    {
        return $user->role === 'Syndic';
    }

    public function restore(User $user, Announcement $announcement): bool
    {
        return false;
    }

    public function forceDelete(User $user, Announcement $announcement): bool
    {
        return false;
    }

    private function matchesRole(User $user, Announcement $announcement): bool
    {
        return $announcement->target_role === 'all'
            || ($announcement->target_role === 'locataires' && $user->role === 'Locataire')
            || (in_array($announcement->target_role, self::TARGET_COPROPRIETAIRES, true)
                && $user->role === 'Coproprietaire');
    }

    private function matchesBuilding(User $user, Announcement $announcement): bool
    {
        return $announcement->building_id === null
            || $user->apartments()
                ->whereHas('floor', fn ($query) => $query->where('building_id', $announcement->building_id))
                ->exists();
    }
}
