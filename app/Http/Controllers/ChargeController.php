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
use App\Policies\ChargePolicy;
use App\Models\Audit_log;
class ChargeController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Charge::class);

        $query = Charge::query()->latest();

        if ($request->user()->role !== 'Syndic') {
            $query->whereHas('apartment', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        }

        return Inertia::render('Charges/Index', [
            'charges' => $query->paginate(10),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Charge::class);

        return Inertia::render('Charges/Create', [
            'apartments' => Apartment::query()->orderBy('number')->get(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $this->authorize('create', Charge::class);

        $validated = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'apartment_id' => ['required', $this->tenantExists('apartments')],
            'status' => ['required', Rule::in(['pending', 'paid', 'overdue'])],
        ]);

        $charge = Charge::create($validated);
        $charge->load('apartment.user');
 Audit_log:: create([
    'action'=> 'Creation de charge',
    'details'=>'Une charge de '.$charge->amount.' DH a ete creee.',
'performed_by' =>auth()->id(),
 ]);

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
        $this->authorize('view',$charge);
        return Inertia::render('Charges/Show', [
            'charge' => $charge,
        ]);
    }

    public function edit(Charge $charge): Response
    {
        $this->authorize('update', $charge);

        return Inertia::render('Charges/Edit', [
            'charge' => $charge,
            'apartments' => Apartment::query()->orderBy('number')->get(),
        ]);
    }

    public function update(Request $request, Charge $charge): RedirectResponse
    {
        $this->authorize('update', $charge);

        $validated = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'apartment_id' => ['required', $this->tenantExists('apartments')],
            'status' => ['required', Rule::in(['pending', 'paid', 'overdue'])],
        ]);

        $charge->update($validated);

Audit_log::create([
    'action' => 'Modification de charge',
    'details' => 'La charge '.$charge->description.' a ete modifiee.',
    'performed_by' => auth()->id(),
]);


        return redirect()->route('charges.index')->with('success', 'Charge updated successfully.');
    }

    public function destroy(Charge $charge): RedirectResponse
    {
        $this->authorize('delete', $charge);

        $charge->delete();
        Audit_log::create([
    'action' => 'Suppression de charge',
    'details' => 'La charge '.$charge->description.' a ete supprimee.',
    'performed_by' => auth()->id(),
]);


        return redirect()->route('charges.index')->with('success', 'Charge deleted successfully.');
    }
}
