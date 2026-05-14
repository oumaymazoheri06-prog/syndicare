<?php

namespace App\Http\Controllers;

use App\Events\AnnouncementCreated;
use App\Models\Announcement;
use App\Models\Building;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Announcements/Index', [
            'announcements' => Announcement::with(['creator', 'building'])
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Announcements/Create', [
            'buildings' => Building::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'target_role' => ['required', Rule::in(['all', 'copropriétaires', 'locataires'])],
            'building_id' => ['nullable', 'exists:buildings,id'],
        ]);

        $announcement = Announcement::create([
            ...$validated,
            'creator_id' => $request->user()->id,
            'building_id' => $validated['building_id'] ?? null,
        ]);

        $notifications->createForAudience(
            $this->notificationRolesForTarget($announcement->target_role),
            $announcement->building_id,
            'Nouvelle annonce',
            Str::limit($announcement->title.': '.$announcement->content, 180),
            'info'
        );

        broadcast(new AnnouncementCreated($announcement->load('creator', 'building')));

        return redirect()->back()->with('success', 'Annonce publiee avec succes.');
    }

    public function show(Announcement $announcement): Response
    {
        return Inertia::render('Announcements/Show', [
            'announcement' => $announcement,
        ]);
    }

    public function edit(Announcement $announcement): Response
    {
        return Inertia::render('Announcements/Edit', [
            'announcement' => $announcement,
        ]);
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);

        $announcement->update($validated);

        return redirect()->route('announcements.index')->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return redirect()->route('announcements.index')->with('success', 'Announcement deleted successfully.');
    }

    private function notificationRolesForTarget(string $targetRole): array
    {
        return match ($targetRole) {
            'locataires' => ['Locataire'],
            'copropriétaires', 'coproprietaires', 'copropriÃ©taires', 'copropriÃƒÂ©taires' => ['Coproprietaire'],
            default => ['Locataire', 'Coproprietaire'],
        };
    }
}
