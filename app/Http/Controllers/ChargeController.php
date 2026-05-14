<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\Charge;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ChargeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Charges/Index', [
            'charges' => Charge::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Charges/Create', [
            'apartments' => Apartment::query()->orderBy('number')->get(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $validated = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'apartment_id' => ['required', 'exists:apartments,id'],
            'status' => ['required', Rule::in(['pending', 'paid', 'overdue'])],
        ]);

        $charge = Charge::create($validated);
        $charge->load('apartment.user');

        $notifications->createForUser(
            $charge->apartment?->user,
            'Nouvelle charge',
            sprintf(
                'Une charge de %s MAD a ete creee pour l appartement %s.',
                number_format((float) $charge->amount, 2, ',', ' '),
                $charge->apartment?->number ?? 'n/a'
            ),
            'warning'
        );

        return redirect()->route('charges.index')->with('success', 'Charge created successfully.');
    }

    public function show(Charge $charge): Response
    {
        return Inertia::render('Charges/Show', [
            'charge' => $charge,
        ]);
    }

    public function edit(Charge $charge): Response
    {
        return Inertia::render('Charges/Edit', [
            'charge' => $charge,
            'apartments' => Apartment::query()->orderBy('number')->get(),
        ]);
    }

    public function update(Request $request, Charge $charge): RedirectResponse
    {
        $validated = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'apartment_id' => ['required', 'exists:apartments,id'],
            'status' => ['required', Rule::in(['pending', 'paid', 'overdue'])],
        ]);

        $charge->update($validated);

        return redirect()->route('charges.index')->with('success', 'Charge updated successfully.');
    }

    public function destroy(Charge $charge): RedirectResponse
    {
        $charge->delete();

        return redirect()->route('charges.index')->with('success', 'Charge deleted successfully.');
    }
}
