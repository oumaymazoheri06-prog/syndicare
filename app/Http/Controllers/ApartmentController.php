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
            'apartments' => Apartment::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Apartments/Create', [
            'floors' => Floor::query()->orderBy('number')->get(),
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

        Apartment::create($validated);
Audit_log::create([
    'action' => 'Creation de apartment',
    'details' => 'Un appartement numero "' . $validated['number'] . '" a été créé au floor ID ' . $validated['floor_id'] . ' par ' . $request->user()->name . '.',
    'performed_by' => auth()->id(),
]);
        return redirect()->route('apartments.index')->with('success', 'Apartment created successfully.');
    }

    public function show(Apartment $apartment): Response
    {
        return Inertia::render('Apartments/Show', [
            'apartment' => $apartment,
        ]);
    }

    public function edit(Apartment $apartment): Response
    {
        return Inertia::render('Apartments/Edit', [
            'apartment' => $apartment,
            'floors' => Floor::query()->orderBy('number')->get(),
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
            'action' => 'Mise à jour de apartment',
            'details' => 'L\'appartement ID '.$apartment->id.' a été mis à jour en "' . $validated['number'] . '" par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('apartments.index')->with('success', 'Apartment updated successfully.');
    }

    public function destroy(Apartment $apartment, Request $request): RedirectResponse
    {
        $apartment->delete();
Audit_log::create([
            'action' => 'Suppression de apartment',
            'details' => 'L\'appartement ID '.$apartment->id.' a été supprimé par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('apartments.index')->with('success', 'Apartment deleted successfully.');
    }
}
