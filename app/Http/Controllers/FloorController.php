<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Floor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FloorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Floors/Index', [
            'floors' => Floor::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Floors/Create', [
            'buildings' => Building::query()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'number' => ['required', 'string', 'max:255', 'unique:floors,number'],
            'building_id' => ['required', 'exists:buildings,id'],
        ]);

        Floor::create($validated);

        return redirect()->route('floors.index')->with('success', 'Floor created successfully.');
    }

    public function show(Floor $floor): Response
    {
        return Inertia::render('Floors/Show', [
            'floor' => $floor,
        ]);
    }

    public function edit(Floor $floor): Response
    {
        return Inertia::render('Floors/Edit', [
            'floor' => $floor,
            'buildings' => Building::query()->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Floor $floor): RedirectResponse
    {
        $validated = $request->validate([
            'number' => ['required', 'string', 'max:255', Rule::unique('floors', 'number')->ignore($floor->id)],
            'building_id' => ['required', 'exists:buildings,id'],
        ]);

        $floor->update($validated);

        return redirect()->route('floors.index')->with('success', 'Floor updated successfully.');
    }

    public function destroy(Floor $floor): RedirectResponse
    {
        $floor->delete();

        return redirect()->route('floors.index')->with('success', 'Floor deleted successfully.');
    }
}
