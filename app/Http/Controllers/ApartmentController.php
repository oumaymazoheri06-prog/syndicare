<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\Audit_log;
use App\Models\Floor;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ApartmentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Apartments/Index', [
            'apartments' => Apartment::query()
                ->with(['floor.building', 'user'])
                ->latest()
                ->paginate(10)
                ->through(fn (Apartment $apartment) => $this->serializeApartment($apartment)),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Apartments/Create', [
            'floors' => Floor::query()
                ->with('building')
                ->orderBy('number')
                ->get()
                ->map(fn (Floor $floor) => [
                    'id' => $floor->id,
                    'label' => $this->formatFloorLabel($floor),
                ]),
            'users' => User::query()
                ->where('organization_id', request()->user()?->organization_id)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'number' => ['required', 'string', 'max:255', $this->tenantUnique('apartments', 'number')],
            'floor_id' => ['required', $this->tenantExists('floors')],
            'user_id' => ['nullable', $this->tenantExists('users')],
            'area' => ['nullable', 'numeric', 'min:0'],
        ]);

        $organization = $request->user()->organization;

$limits = [
    'basic' => 20,
    'standard' => 100,
    'premium' => 1000,
];

$maxLots = $limits[$organization->plan] ?? 0;

$currentLots = Apartment::query()
    ->where('organization_id', $organization->id)
    ->count();

if ($maxLots > 0 && $currentLots >= $maxLots) {
    return back()->with('error', 'Votre plan limite votre organisation à '.$maxLots.' lots.');
}
        Apartment::create($validated);
Audit_log::create([
    'action' => "Création d'appartement",
    'details' => 'Un appartement numéro "' . $validated['number'] . '" a été créé à l\'étage ID ' . $validated['floor_id'] . ' par ' . $request->user()->name . '.',
    'performed_by' => auth()->id(),
]);
        return redirect()->route('apartments.index')->with('success', 'Lot créé avec succès.');
    }

    public function show(Apartment $apartment): Response
    {
        $apartment->load(['floor.building', 'user']);

        return Inertia::render('Apartments/Show', [
            'apartment' => $this->serializeApartment($apartment),
        ]);
    }

    public function edit(Apartment $apartment): Response
    {
        return Inertia::render('Apartments/Edit', [
            'apartment' => $apartment,
            'floors' => Floor::query()
                ->with('building')
                ->orderBy('number')
                ->get()
                ->map(fn (Floor $floor) => [
                    'id' => $floor->id,
                    'label' => $this->formatFloorLabel($floor),
                ]),
            'users' => User::query()
                ->where('organization_id', request()->user()?->organization_id)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function update(Request $request, Apartment $apartment): RedirectResponse
    {
        $validated = $request->validate([
            'number' => ['required', 'string', 'max:255', $this->tenantUnique('apartments', 'number')->ignore($apartment->id)],
            'floor_id' => ['required', $this->tenantExists('floors')],
            'user_id' => ['nullable', $this->tenantExists('users')],
            'area' => ['nullable', 'numeric', 'min:0'],
        ]);

        $apartment->update($validated);
Audit_log::create([
            'action' => "Mise à jour d'appartement",
            'details' => 'L\'appartement ID '.$apartment->id.' a été mis à jour en "' . $validated['number'] . '" par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('apartments.index')->with('success', 'Lot mis à jour avec succès.');
    }

    public function updateOccupancy(Request $request, Apartment $apartment): RedirectResponse
    {
        $isOccupied = $request->boolean('is_occupied');
        $validated = $request->validate([
            'is_occupied' => ['required', 'boolean'],
            'user_id' => [
                'nullable',
                Rule::exists('users', 'id')
                    ->where(fn ($query) => $query
                        ->where('organization_id', $request->user()?->organization_id)
                        ->whereIn('role', ['Coproprietaire', 'Locataire'])),
            ],
        ]);

        if ($isOccupied && empty($validated['user_id'])) {
            return back()->withErrors([
                'user_id' => 'Choisissez un résident pour occuper ce lot.',
            ]);
        }

        $apartment->forceFill([
            'user_id' => $isOccupied ? $validated['user_id'] : null,
        ])->save();

        Audit_log::create([
            'action' => "Mise à jour de l'occupation du lot",
            'details' => 'Le lot '.$apartment->number.' est maintenant '.($apartment->user_id ? 'occupé' : 'vide').'.',
            'performed_by' => auth()->id(),
        ]);

        return back()->with('success', 'Occupation du lot mise à jour.');
    }

    public function destroy(Apartment $apartment, Request $request): RedirectResponse
    {
        $apartment->delete();
Audit_log::create([
            'action' => "Suppression d'appartement",
            'details' => 'L\'appartement ID '.$apartment->id.' a été supprimé par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('apartments.index')->with('success', 'Lot supprimé avec succès.');
    }

    private function serializeApartment(Apartment $apartment): array
    {
        return [
            'id' => $apartment->id,
            'number' => $apartment->number,
            'floor_id' => $apartment->floor_id,
            'floor_label' => $apartment->floor ? $this->formatFloorLabel($apartment->floor) : '-',
            'building_label' => $apartment->floor?->building?->name ?? '-',
            'user_id' => $apartment->user_id,
            'resident_label' => $apartment->user?->name ?? 'Aucun résident',
            'occupancy_status' => $apartment->user_id ? 'Occupé' : 'Vide',
            'area' => $apartment->area,
        ];
    }

    private function formatFloorLabel(Floor $floor): string
    {
        $label = 'Étage '.$floor->number;

        if ($floor->building?->name) {
            $label .= ' - '.$floor->building->name;
        }

        return $label;
    }
}
