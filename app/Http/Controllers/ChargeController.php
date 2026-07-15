<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\Charge;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Audit_log;
class ChargeController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Charge::class);

        $query = Charge::query()
            ->with(['apartment', 'latestPayment'])
            ->latest();

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
        ]);
        $validated['status'] = 'pending';

        $charge = Charge::create($validated);
        $charge->load('apartment.user');
 Audit_log:: create([
    'action'=> 'Création de charge',
    'details'=>'Une charge de '.$charge->amount.' DH a été créée.',
'performed_by' =>auth()->id(),
 ]);

        if ($charge->apartment?->user?->role === 'Coproprietaire') {
            $notifications->createForUser(
                $charge->apartment->user,
                'Nouvelle charge',
                sprintf(
                    'Une charge de %s MAD a été créée pour l\'appartement %s.',
                    number_format((float) $charge->amount, 2, ',', ' '),
                    $charge->apartment?->number ?? 'n/a'
                ),
                'warning'
            );
        }

        return redirect()->route('charges.index')->with('success', 'Charge créée avec succès.');
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
        ]);
        $previousAmount = (float) $charge->amount;

        $charge->update($validated);

Audit_log::create([
    'action' => 'Modification de charge',
    'details' => 'La charge '.$charge->description.' a été modifiée.',
    'performed_by' => auth()->id(),
]);

        if ($charge->status === 'paid' && $previousAmount !== (float) $charge->amount) {
            $payment = $charge->payments()
                ->where('status', 'validated')
                ->latest()
                ->first();

            if ($payment) {
                $payment->update(['amount' => $charge->amount]);

                Audit_log::create([
                    'action' => 'Mise à jour de paiement',
                    'details' => 'Le paiement lié à la charge "'.$charge->description.'" a été ajusté à '.$charge->amount.' DH.',
                    'performed_by' => auth()->id(),
                ]);
            }
        }


        return redirect()->route('charges.index')->with('success', 'Charge mise à jour avec succès.');
    }

    public function updateStatus(Request $request, Charge $charge, NotificationService $notifications): RedirectResponse
    {
        $this->authorize('update', $charge);

        $validated = $request->validate([
            'paid' => ['required', 'boolean'],
        ]);

        $markAsPaid = $request->boolean('paid');

        DB::transaction(function () use ($charge, $markAsPaid, $notifications): void {
            $charge->load(['apartment.user']);

            if ($markAsPaid) {
                $payment = $charge->payments()
                    ->where('status', 'validated')
                    ->latest()
                    ->first();
                $createdPayment = false;

                if (! $payment) {
                    $payment = $charge->payments()
                        ->where('status', 'pending')
                        ->latest()
                        ->first();
                }

                if ($payment) {
                    $wasValidated = $payment->status === 'validated';

                    $payment->update([
                        'status' => 'validated',
                        'payment_date' => $payment->payment_date ?? now()->toDateString(),
                        'amount' => $charge->amount,
                        'method' => $payment->method ?? 'manuel',
                        'user_id' => $payment->user_id ?? $charge->apartment?->user_id,
                    ]);

                    if (! $wasValidated) {
                        Audit_log::create([
                            'action' => 'Validation de paiement',
                            'details' => 'Le paiement de '.$payment->amount.' DH a été validé depuis la charge "'.$charge->description.'".',
                            'performed_by' => auth()->id(),
                        ]);
                    }
                } else {
                    $payment = $charge->payments()->create([
                        'amount' => $charge->amount,
                        'status' => 'validated',
                        'payment_date' => now()->toDateString(),
                        'method' => 'manuel',
                        'user_id' => $charge->apartment?->user_id,
                    ]);
                    $createdPayment = true;

                    Audit_log::create([
                        'action' => 'Création de paiement',
                        'details' => 'Un paiement manuel de '.$payment->amount.' DH a été créé pour marquer la charge "'.$charge->description.'" comme payée.',
                        'performed_by' => auth()->id(),
                    ]);
                }

                $charge->update(['status' => 'paid']);

                Audit_log::create([
                    'action' => 'Validation de charge',
                    'details' => 'La charge "'.$charge->description.'" a été marquée comme payée.',
                    'performed_by' => auth()->id(),
                ]);

                if ($createdPayment || $payment->wasChanged('status')) {
                    $payment->refresh()->load(['charge.apartment.user', 'user']);

                    $notifications->createForUser(
                        $payment->user ?? $charge->apartment?->user,
                        'Paiement validé',
                        sprintf(
                            'Votre paiement de %s MAD pour la charge "%s" du lot %s a été validé.',
                            number_format((float) $payment->amount, 2, ',', ' '),
                            $charge->description ?? 'Charge',
                            $charge->apartment?->number ?? 'n/a'
                        ),
                        'info'
                    );
                }

                return;
            }

            $nextStatus = $charge->date && $charge->date->lt(today()) ? 'overdue' : 'pending';
            $validatedPayments = $charge->payments()
                ->where('status', 'validated')
                ->get();

            foreach ($validatedPayments as $payment) {
                $payment->update(['status' => 'pending']);

                Audit_log::create([
                    'action' => 'Paiement remis en attente',
                    'details' => 'Le paiement de '.$payment->amount.' DH lié à la charge "'.$charge->description.'" a été remis en attente.',
                    'performed_by' => auth()->id(),
                ]);
            }

            $charge->update(['status' => $nextStatus]);

            Audit_log::create([
                'action' => 'Charge remise en attente',
                'details' => 'La charge "'.$charge->description.'" a été remise en '.($nextStatus === 'overdue' ? 'retard' : 'attente').'.',
                'performed_by' => auth()->id(),
            ]);
        });

        return back()->with('success', $markAsPaid
            ? 'Charge marquée comme payée.'
            : 'Charge remise en attente.');
    }

    public function destroy(Charge $charge): RedirectResponse
    {
        $this->authorize('delete', $charge);

        $charge->delete();
        Audit_log::create([
    'action' => 'Suppression de charge',
    'details' => 'La charge '.$charge->description.' a été supprimée.',
    'performed_by' => auth()->id(),
]);


        return redirect()->route('charges.index')->with('success', 'Charge supprimée avec succès.');
    }
}
