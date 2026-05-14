<?php

namespace App\Http\Controllers;

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

        return redirect()->route('buildings.index')->with('success', 'Building updated successfully.');
    }

    public function destroy(Building $building): RedirectResponse
    {
        $building->delete();

        return redirect()->route('buildings.index')->with('success', 'Building deleted successfully.');
    }
}
