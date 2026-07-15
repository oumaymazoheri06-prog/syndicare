<?php

namespace App\Http\Controllers;

use App\Models\Audit_log;
use App\Models\Building;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuildingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Buildings/Index', [
            'buildings' => Building::query()
                ->withCount([
                    'floors',
                    'apartments',
                    'apartments as occupied_apartments_count' => fn ($query) => $query->whereNotNull('apartments.user_id'),
                    'apartments as vacant_apartments_count' => fn ($query) => $query->whereNull('apartments.user_id'),
                ])
                ->latest()
                ->paginate(10)
                ->through(fn (Building $building) => [
                    'id' => $building->id,
                    'name' => $building->name,
                    'address' => $building->address,
                    'floors_count' => $building->floors_count,
                    'apartments_count' => $building->apartments_count,
                    'occupied_apartments_count' => $building->occupied_apartments_count,
                    'vacant_apartments_count' => $building->vacant_apartments_count,
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Buildings/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
        ]);

        Building::create($validated);
Audit_log::create([
    'action' => "Création d'immeuble",
    'details' => 'Un immeuble nommé "' . $validated['name'] . '" a été créé à l\'adresse "' . $validated['address'] . '".',
    'performed_by' => auth()->id(),
]);
        return redirect()->route('buildings.index')->with('success', 'Immeuble créé avec succès.');
    }

    public function show(Building $building): Response
    {
        $building->loadCount([
            'floors',
            'apartments',
            'apartments as occupied_apartments_count' => fn ($query) => $query->whereNotNull('apartments.user_id'),
            'apartments as vacant_apartments_count' => fn ($query) => $query->whereNull('apartments.user_id'),
        ]);

        $building->load([
            'floors' => fn ($query) => $query
                ->with([
                    'apartments' => fn ($query) => $query
                        ->with('user')
                        ->orderBy('number'),
                ])
                ->orderBy('number'),
        ]);

        return Inertia::render('Buildings/Show', [
            'building' => $this->serializeBuildingDetails($building),
            'residentOptions' => $this->residentOptions(),
        ]);
    }

    public function edit(Building $building): Response
    {
        return Inertia::render('Buildings/Edit', [
            'building' => $building,
        ]);
    }

    public function update(Request $request, Building $building): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
        ]);

        $building->update($validated);
Audit_log::create([
            'action' => "Mise à jour d'immeuble",
            'details' => 'L\'immeuble ID '.$building->id.' a été mis à jour en "' . $validated['name'] . '" par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('buildings.index')->with('success', 'Immeuble mis à jour avec succès.');
    }

    public function destroy(Building $building, Request $request): RedirectResponse
    {
        $building->delete();
Audit_log::create([
            'action' => "Suppression d'immeuble",
            'details' => 'L\'immeuble ID '.$building->id.' a été supprimé par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('buildings.index')->with('success', 'Immeuble supprimé avec succès.');
    }

    private function serializeBuildingDetails(Building $building): array
    {
        $floors = $building->floors
            ->sortBy('number', SORT_NATURAL)
            ->values();
        $apartments = $floors->flatMap(fn ($floor) => $floor->apartments);
        $apartmentsCount = $apartments->count();
        $occupiedCount = $apartments->whereNotNull('user_id')->count();

        return [
            'id' => $building->id,
            'name' => $building->name,
            'address' => $building->address,
            'floors_count' => $floors->count(),
            'apartments_count' => $apartmentsCount,
            'occupied_apartments_count' => $occupiedCount,
            'vacant_apartments_count' => max(0, $apartmentsCount - $occupiedCount),
            'occupancy_rate' => $apartmentsCount > 0
                ? round(($occupiedCount / $apartmentsCount) * 100)
                : 0,
            'floors' => $floors->map(fn ($floor) => [
                'id' => $floor->id,
                'number' => $floor->number,
                'apartments_count' => $floor->apartments->count(),
                'occupied_apartments_count' => $floor->apartments->whereNotNull('user_id')->count(),
                'vacant_apartments_count' => $floor->apartments->whereNull('user_id')->count(),
                'apartments' => $floor->apartments
                    ->sortBy('number', SORT_NATURAL)
                    ->values()
                    ->map(fn ($apartment) => [
                        'id' => $apartment->id,
                        'number' => $apartment->number,
                        'area' => $apartment->area !== null ? (float) $apartment->area : null,
                        'is_occupied' => $apartment->user_id !== null,
                        'resident' => $apartment->user ? [
                            'id' => $apartment->user->id,
                            'name' => $apartment->user->name,
                            'email' => $apartment->user->email,
                            'role' => $apartment->user->role,
                        ] : null,
                    ]),
            ]),
        ];
    }

    private function residentOptions(): array
    {
        return User::query()
            ->where('organization_id', request()->user()?->organization_id)
            ->whereIn('role', ['Coproprietaire', 'Locataire'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'label' => $user->name.' - '.$user->role,
            ])
            ->values()
            ->all();
    }
}
