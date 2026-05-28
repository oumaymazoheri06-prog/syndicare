<?php

namespace App\Http\Controllers;

use App\Models\Audit_log;
use App\Models\Charge;
use App\Models\Payment;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Payment::class);

        $query = Payment::query()->with('charge.apartment')->latest();

        if ($request->user()->role !== 'Syndic') {
            $query->whereHas('charge.apartment', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        }

        return Inertia::render('Payments/Index', [
            'payments' => $query->paginate(10),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Payment::class);

        $charges = Charge::query()->orderBy('date');

        if ($request->user()->role !== 'Syndic') {
            $charges->whereHas('apartment', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        }

        return Inertia::render('Payments/Create', [
            'charges' => $charges->get(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $this->authorize('create', Payment::class);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'charge_id' => ['required', $this->tenantExists('charges')],
            'status' => ['required', Rule::in(['pending', 'validated'])],
            'payment_date' => ['nullable', 'date'],
        ]);

        $charge = Charge::query()->with('apartment')->findOrFail($validated['charge_id']);
        $this->authorize('view', $charge);

        if ($request->user()->role !== 'Syndic') {
            $validated['status'] = 'pending';
        }

        $lockName = 'payment:create:charge:'.$validated['charge_id'].':user:'.$request->user()->id;
        $lock = Cache::lock($lockName, 300);

        if (! $lock->get()) {
            return back()->with('error', 'Cette action est deja en cours.');
        }

        try {
            $payment = Payment::create($validated);

            $payment->load('charge.apartment.floor.building');

            Audit_log::create([
                'action' => 'Creation de paiement',
                'details' => 'Un paiement de '.$payment->amount.' DH a ete enregistre pour la charge "'.$payment->charge->description.'" de l\'appartement '.$payment->charge->apartment->number.'.',
                'performed_by' => auth()->id(),
            ]);

            $notifications->createForRole(
                'Syndic',
                'Nouveau paiement',
                sprintf(
                    'Un paiement de %s MAD a ete enregistre pour la charge "%s".',
                    number_format((float) $payment->amount, 2, ',', ' '),
                    $payment->charge?->description ?? 'Charge'
                ),
                'info'
            );

            return redirect()->route('payments.index')->with('success', 'Payment created successfully.');
        } finally {
            $lock->release();
        }
    }

    public function show(Payment $payment): Response
    {
        $this->authorize('view', $payment);

        return Inertia::render('Payments/Show', [
            'payment' => $payment,
        ]);
    }

    public function edit(Payment $payment): Response
    {
        $this->authorize('update', $payment);

        return Inertia::render('Payments/Edit', [
            'payment' => $payment,
            'charges' => Charge::query()->orderBy('date')->get(),
        ]);
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        $this->authorize('update', $payment);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'charge_id' => ['required', $this->tenantExists('charges')],
            'status' => ['required', Rule::in(['pending', 'validated'])],
            'payment_date' => ['nullable', 'date'],
        ]);

        $payment->update($validated);

        Audit_log::create([
            'action' => 'Mise à jour de paiement',
            'details' => 'Le paiement de '.$payment->amount.' DH a été mis à jour pour la charge "'.$payment->charge->description.'" de l\'appartement '.$payment->charge->apartment->number.'.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('payments.index')->with('success', 'Payment updated successfully.');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $this->authorize('delete', $payment);

        $payment->delete();

        Audit_log::create([
            'action' => 'Suppression de paiement',
            'details' => 'Le paiement de '.$payment->amount.' DH a été supprimé pour la charge "'.$payment->charge->description.'" de l\'appartement '.$payment->charge->apartment->number.'.',
            'performed_by' => auth()->id(),
        ]);
                                                 
        return redirect()->route('payments.index')->with('success', 'Payment deleted successfully.');
    }
}
