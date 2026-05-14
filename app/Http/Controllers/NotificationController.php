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
        $this->ensureSyndic();

        return Inertia::render('Notifications/Create', [
            'users' => User::query()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $this->ensureSyndic();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'user_id' => ['required', 'exists:users,id'],
            'type' => ['required', Rule::in(['info', 'warning', 'error'])],
            'is_read' => ['nullable', 'boolean'],
        ]);

        $targetUser = User::query()->find($validated['user_id']);

        $notifications->createForUser(
            $targetUser,
            $validated['title'],
            $validated['message'],
            $validated['type']
        );

        return redirect()->route('notifications.index')->with('success', 'Alerte creee avec succes.');
    }

    public function show(Request $request, Notification $notification): Response
    {
        $this->ensureCanView($request, $notification);

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
        $this->ensureSyndic();

        return Inertia::render('Notifications/Edit', [
            'notification' => $notification,
            'users' => User::query()->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Notification $notification): RedirectResponse
    {
        $this->ensureSyndic();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'user_id' => ['required', 'exists:users,id'],
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

        return redirect()->route('notifications.index')->with('success', 'Alerte mise a jour avec succes.');
    }

    public function destroy(Request $request, Notification $notification): RedirectResponse
    {
        $this->ensureSyndic();

        $notification->delete();

        return redirect()->route('notifications.index')->with('success', 'Alerte supprimee avec succes.');
    }

    public function markRead(Request $request, Notification $notification): RedirectResponse
    {
        $this->ensureCanView($request, $notification);

        $notification->update([
            'is_read' => true,
        ]);

        return back()->with('success', 'Alerte marquee comme lue.');
    }

    public function markUnread(Request $request, Notification $notification): RedirectResponse
    {
        $this->ensureCanView($request, $notification);

        $notification->update([
            'is_read' => false,
        ]);

        return back()->with('success', 'Alerte marquee comme non lue.');
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->notifications()
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back()->with('success', 'Toutes les alertes ont ete marquees comme lues.');
    }

    private function ensureSyndic(): void
    {
        abort_unless(request()->user()?->role === 'Syndic', 403, 'Unauthorized');
    }

    private function ensureCanView(Request $request, Notification $notification): void
    {
        abort_unless(
            $request->user()?->role === 'Syndic' || $notification->user_id === $request->user()?->id,
            403,
            'Unauthorized'
        );
    }
}
