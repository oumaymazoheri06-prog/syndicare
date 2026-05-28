<?php

namespace App\Http\Controllers;

use App\Models\Audit_log;
use App\Models\Building;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuildingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Buildings/Index', [
            'buildings' => Building::query()->latest()->paginate(10),
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
    'action' => 'Creation de building',
    'details' => 'Un building nommé "' . $validated['name'] . '" a été créé à l\'adresse "' . $validated['address'] . '".',
    'performed_by' => auth()->id(),
]);
        return redirect()->route('buildings.index')->with('success', 'Building created successfully.');
    }

    public function show(Building $building): Response
    {
        return Inertia::render('Buildings/Show', [
            'building' => $building,
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
            'action' => 'Mise à jour de building',
            'details' => 'Le building ID '.$building->id.' a été mis à jour en "' . $validated['name'] . '" par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('buildings.index')->with('success', 'Building updated successfully.');
    }

    public function destroy(Building $building, Request $request): RedirectResponse
    {
        $building->delete();
Audit_log::create([
            'action' => 'Suppression de building',
            'details' => 'Le building ID '.$building->id.' a été supprimé par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('buildings.index')->with('success', 'Building deleted successfully.');
    }
}
