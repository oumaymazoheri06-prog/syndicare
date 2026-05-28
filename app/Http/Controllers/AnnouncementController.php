<?php

namespace App\Http\Controllers;

use App\Events\AnnouncementCreated;
use App\Models\Announcement;
use App\Models\Audit_log;
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
    private const TARGET_COPROPRIETAIRES = ['coproprietaires', 'copropriétaires'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Announcement::class);

        $query = Announcement::query()->with(['creator', 'building'])->latest();

        if ($request->user()->role !== 'Syndic') {
            $query
                ->where(function ($roleQuery) use ($request) {
                    $roleQuery->where('target_role', 'all');

                    if ($request->user()->role === 'Locataire') {
                        $roleQuery->orWhere('target_role', 'locataires');
                    }

                    if ($request->user()->role === 'Coproprietaire') {
                        $roleQuery->orWhereIn('target_role', self::TARGET_COPROPRIETAIRES);
                    }
                })
                ->where(function ($buildingQuery) use ($request) {
                    $buildingQuery->whereNull('building_id')
                        ->orWhereIn('building_id', $request->user()
                            ->apartments()
                            ->with('floor:id,building_id')
                            ->get()
                            ->pluck('floor.building_id')
                            ->filter()
                            ->unique());
                });
        }

        return Inertia::render('Announcements/Index', [
            'announcements' => $query->paginate(10),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Announcement::class);

        return Inertia::render('Announcements/Create', [
            'buildings' => Building::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $this->authorize('create', Announcement::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'target_role' => ['required', Rule::in(['all', 'coproprietaires', 'locataires'])],
            'building_id' => ['nullable', $this->tenantExists('buildings')],
        ]);

        $announcement = Announcement::create([
            ...$validated,
            'creator_id' => $request->user()->id,
            'building_id' => $validated['building_id'] ?? null,
        ]);
  Audit_log::create([
            'action' => 'Creation d annonce',
            'details' => 'Une annonce intitulee "' . $validated['title'] . '" a ete creee par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
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
        $this->authorize('view', $announcement);

        return Inertia::render('Announcements/Show', [
            'announcement' => $announcement,
        ]);
    }

    public function edit(Announcement $announcement): Response
    {
        $this->authorize('update', $announcement);

        return Inertia::render('Announcements/Edit', [
            'announcement' => $announcement,
        ]);
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $this->authorize('update', $announcement);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);

        $announcement->update($validated);
Audit_log::create([
            'action' => 'Mise a jour d annonce',
            'details' => 'L\'annonce ID '.$announcement->id.' a ete mise a jour en "' . $validated['title'] . '" par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('announcements.index')->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement, Request $request): RedirectResponse
    {
        $this->authorize('delete', $announcement);

        $announcement->delete();
Audit_log::create([
            'action' => 'Suppression d annonce',
            'details' => 'L\'annonce ID '.$announcement->id.' a ete supprimee par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('announcements.index')->with('success', 'Announcement deleted successfully.');
    }

    private function notificationRolesForTarget(string $targetRole): array
    {
        if ($targetRole === 'locataires') {
            return ['Locataire'];
        }

        if (in_array($targetRole, self::TARGET_COPROPRIETAIRES, true)) {
            return ['Coproprietaire'];
        }

        return ['Locataire', 'Coproprietaire'];
    }
}
