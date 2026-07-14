<?php

namespace App\Http\Controllers;

use App\Models\Audit_log;
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
            'number' => ['required', 'string', 'max:255', $this->tenantUnique('floors', 'number')],
            'building_id' => ['required', $this->tenantExists('buildings')],
        ]);

        Floor::create($validated);
Audit_log:: create([
    'action'=> "Création d'étage",
    'details'=>'Un étage numéro '.$validated['number'].' a été créé dans le bâtiment ID '.$validated['building_id'].'.',
'performed_by' =>auth()->id(),
]);
        return redirect()->route('floors.index')->with('success', 'Étage créé avec succès.');
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
            'number' => ['required', 'string', 'max:255', $this->tenantUnique('floors', 'number')->ignore($floor->id)],
            'building_id' => ['required', $this->tenantExists('buildings')],
        ]);

        $floor->update($validated);
Audit_log::create([
    'action' => "Mise à jour d'étage",
    'details' => 'L\'étage ID '.$floor->id.' a été mis à jour en numéro '.$validated['number'].' dans le bâtiment ID '.$validated['building_id'].'.',
    'performed_by' => auth()->id(),
]);
        return redirect()->route('floors.index')->with('success', 'Étage mis à jour avec succès.');
    }

    public function destroy(Floor $floor): RedirectResponse
    {
        $floor->delete();
Audit_log::create([
    'action' => "Suppression d'étage",
    'details' => 'L\'étage ID '.$floor->id.' a été supprimé.',
    'performed_by' => auth()->id(),
]);
        return redirect()->route('floors.index')->with('success', 'Étage supprimé avec succès.');
    }
}
