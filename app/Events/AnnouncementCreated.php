<?php

namespace App\Events;

use App\Models\Announcement;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnnouncementCreated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    private const TARGET_COPROPRIETAIRES = ['coproprietaires', 'copropriétaires'];

    public function __construct(public Announcement $announcement) {}

    public function broadcastOn(): array
    {
        $buildingSegment = $this->announcement->building_id ?? 'all';
        $targetRole = $this->announcement->target_role;
        $roleSegment = match (true) {
            $targetRole === 'locataires' => 'Locataire',
            in_array($targetRole, self::TARGET_COPROPRIETAIRES, true) => 'Coproprietaire',
            default => 'all',
        };

        return [
            new PrivateChannel("building.{$buildingSegment}.{$roleSegment}"),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->announcement->id,
            'title' => $this->announcement->title,
            'content' => $this->announcement->content,
            'target_role' => $this->announcement->target_role,
            'building' => $this->announcement->building?->name ?? 'Tous les immeubles',
            'author' => $this->announcement->creator->name,
            'created_at' => $this->announcement->created_at->diffForHumans(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'announcement.created';
    }
}
