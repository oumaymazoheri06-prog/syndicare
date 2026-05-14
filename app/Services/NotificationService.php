<?php

namespace App\Services;

use App\Jobs\CreateNotificationsJob;
use App\Models\User;

class NotificationService
{
    public function createForUser(?User $user, string $title, string $message, string $type = 'info'): void
    {
        if (! $user) {
            return;
        }

        $this->createForUserIds([$user->id], $title, $message, $type);
    }

    public function createForUserIds(array $userIds, string $title, string $message, string $type = 'info'): void
    {
        $userIds = array_values(array_unique(array_filter(array_map('intval', $userIds))));

        if ($userIds === []) {
            return;
        }

        $this->dispatchCreationJob('user_ids', $userIds, $title, $message, $type);
    }

    public function createForUsers(iterable $users, string $title, string $message, string $type = 'info'): void
    {
        $userIds = [];

        foreach ($users as $user) {
            if (! $user instanceof User) {
                continue;
            }

            $userIds[] = $user->id;
        }

        if ($userIds === []) {
            return;
        }

        $this->createForUserIds($userIds, $title, $message, $type);
    }

    public function createForRole(string|array $roles, string $title, string $message, string $type = 'info'): void
    {
        $roles = array_values(array_filter(is_array($roles) ? $roles : [$roles]));

        if ($roles === []) {
            return;
        }

        $this->dispatchCreationJob('roles', $roles, $title, $message, $type);
    }

    public function createForAudience(
        string|array|null $roles,
        ?int $buildingId,
        string $title,
        string $message,
        string $type = 'info',
    ): void {
        $roles = array_values(array_filter(is_array($roles) ? $roles : [$roles]));

        $this->dispatchCreationJob('audience', [
            'roles' => $roles,
            'building_id' => $buildingId,
        ], $title, $message, $type);
    }

    public function createForAllUsers(string $title, string $message, string $type = 'info'): void
    {
        $this->dispatchCreationJob('all', [], $title, $message, $type);
    }

    private function dispatchCreationJob(
        string $target,
        array $targetValues,
        string $title,
        string $message,
        string $type,
    ): void {
        if (app()->runningUnitTests()) {
            CreateNotificationsJob::dispatchSync($target, $targetValues, $title, $message, $type);

            return;
        }

        CreateNotificationsJob::dispatchAfterResponse($target, $targetValues, $title, $message, $type);
    }
}
