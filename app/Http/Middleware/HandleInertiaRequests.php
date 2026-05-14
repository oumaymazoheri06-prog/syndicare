<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $buildingIds = $user
            ? $user->apartments()
                ->with('floor:id,building_id')
                ->get()
                ->pluck('floor.building_id')
                ->filter()
                ->unique()
                ->values()
            : [];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'building_ids' => $buildingIds,
            ],
            'notifications' => [
                'unread' => $user
                    ? Notification::query()
                        ->where('user_id', $user->id)
                        ->where('is_read', false)
                        ->count()
                    : 0,
                'latest' => $user
                    ? Notification::query()
                        ->where('user_id', $user->id)
                        ->latest()
                        ->limit(5)
                        ->get(['id', 'title', 'message', 'type', 'is_read', 'created_at'])
                        ->map(fn (Notification $notification) => [
                            'id' => $notification->id,
                            'title' => $notification->title,
                            'message' => $notification->message,
                            'type' => $notification->type,
                            'is_read' => (bool) $notification->is_read,
                            'created_at' => optional($notification->created_at)->format('d/m/Y H:i'),
                        ])
                    : [],
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
