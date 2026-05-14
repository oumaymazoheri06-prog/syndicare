<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CreateNotificationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $target,
        public array $targetValues,
        public string $title,
        public string $message,
        public string $type = 'info',
    ) {}

    public function handle(): void
    {
        $query = User::query()->select(['id']);

        if ($this->target === 'user_ids') {
            $ids = array_values(array_filter(array_map('intval', $this->targetValues)));

            if ($ids === []) {
                return;
            }

            $query->whereIn('id', $ids);
        } elseif ($this->target === 'roles') {
            $roles = array_values(array_filter($this->targetValues));

            if ($roles === []) {
                return;
            }

            $query->whereIn('role', $roles);
        } elseif ($this->target === 'audience') {
            $roles = array_values(array_filter($this->targetValues['roles'] ?? []));
            $buildingId = isset($this->targetValues['building_id'])
                ? (int) $this->targetValues['building_id']
                : null;

            if ($roles !== []) {
                $query->whereIn('role', $roles);
            }

            if ($buildingId) {
                $query->whereHas('apartments.floor', function ($query) use ($buildingId) {
                    $query->where('building_id', $buildingId);
                });
            }
        }

        $query->chunkById(500, function ($users): void {
            $now = now();
            $rows = [];

            foreach ($users as $user) {
                $rows[] = [
                    'title' => $this->title,
                    'message' => $this->message,
                    'user_id' => $user->id,
                    'type' => $this->type,
                    'is_read' => false,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if ($rows !== []) {
                Notification::query()->insert($rows);
            }
        });
    }
}
