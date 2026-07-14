<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Notification::class);

        $query = Notification::query()->latest();

        if ($request->user()?->role !== 'Syndic') {
            $query->where('user_id', $request->user()?->id);
        }

        return Inertia::render('Notifications/Index', [
            'notifications' => $query->paginate(10),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Notification::class);

        return Inertia::render('Notifications/Create', [
            'users' => User::query()
                ->where('organization_id', request()->user()?->organization_id)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $this->authorize('create', Notification::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'user_id' => ['required', $this->tenantExists('users')],
            'type' => ['required', Rule::in(['info', 'warning', 'error'])],
            'is_read' => ['nullable', 'boolean'],
        ]);

        $targetUser = User::query()
            ->where('organization_id', $request->user()->organization_id)
            ->find($validated['user_id']);

        $notifications->createForUser(
            $targetUser,
            $validated['title'],
            $validated['message'],
            $validated['type']
        );

        return redirect()->route('notifications.index')->with('success', 'Alerte créée avec succès.');
    }

    public function show(Request $request, Notification $notification): Response
    {
        $this->authorize('view', $notification);

        if ($request->user()?->id === $notification->user_id && ! $notification->is_read) {
            $notification->update([
                'is_read' => true,
            ]);
        }

        return Inertia::render('Notifications/Show', [
            'notification' => $notification,
        ]);
    }

    public function edit(Request $request, Notification $notification): Response
    {
        $this->authorize('update', $notification);

        return Inertia::render('Notifications/Edit', [
            'notification' => $notification,
            'users' => User::query()
                ->where('organization_id', request()->user()?->organization_id)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function update(Request $request, Notification $notification): RedirectResponse
    {
        $this->authorize('update', $notification);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'user_id' => ['required', $this->tenantExists('users')],
            'type' => ['required', Rule::in(['info', 'warning', 'error'])],
            'is_read' => ['nullable', 'boolean'],
        ]);

        $isRead = array_key_exists('is_read', $validated)
            ? (bool) $validated['is_read']
            : $notification->is_read;

        $notification->update([
            'title' => $validated['title'],
            'message' => $validated['message'],
            'user_id' => $validated['user_id'],
            'type' => $validated['type'],
            'is_read' => $isRead,
        ]);

        return redirect()->route('notifications.index')->with('success', 'Alerte mise à jour avec succès.');
    }

    public function destroy(Request $request, Notification $notification): RedirectResponse
    {
        $this->authorize('delete', $notification);

        $notification->delete();

        return redirect()->route('notifications.index')->with('success', 'Alerte supprimée avec succès.');
    }

    public function markRead(Request $request, Notification $notification): RedirectResponse
    {
        $this->authorize('markRead', $notification);

        $notification->update([
            'is_read' => true,
        ]);

        return back()->with('success', 'Alerte marquée comme lue.');
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->notifications()
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back()->with('success', 'Toutes les alertes ont été marquées comme lues.');
    }
}
