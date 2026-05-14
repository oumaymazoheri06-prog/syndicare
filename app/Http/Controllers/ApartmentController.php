<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
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
            'users' => User::query()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'number' => ['required', 'string', 'max:255', 'unique:apartments,number'],
            'floor_id' => ['required', 'exists:floors,id'],
            'user_id' => ['nullable', 'exists:users,id'],
            'area' => ['nullable', 'numeric', 'min:0'],
        ]);

        Apartment::create($validated);

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
            'users' => User::query()->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Apartment $apartment): RedirectResponse
    {
        $validated = $request->validate([
            'number' => ['required', 'string', 'max:255', Rule::unique('apartments', 'number')->ignore($apartment->id)],
            'floor_id' => ['required', 'exists:floors,id'],
            'user_id' => ['nullable', 'exists:users,id'],
            'area' => ['nullable', 'numeric', 'min:0'],
        ]);

        $apartment->update($validated);

        return redirect()->route('apartments.index')->with('success', 'Apartment updated successfully.');
    }

    public function destroy(Apartment $apartment): RedirectResponse
    {
        $apartment->delete();

        return redirect()->route('apartments.index')->with('success', 'Apartment deleted successfully.');
    }
}
