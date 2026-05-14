<?php

namespace App\Http\Controllers;

use App\Models\Charge;
use App\Models\Payment;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Payments/Index', [
            'payments' => Payment::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Payments/Create', [
            'charges' => Charge::query()->orderBy('date')->get(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'charge_id' => ['required', 'exists:charges,id'],
            'status' => ['required', Rule::in(['pending', 'validated'])],
            'payment_date' => ['nullable', 'date'],
        ]);

        $payment = Payment::create($validated);
        $payment->load('charge.apartment.floor.building');

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
    }

    public function show(Payment $payment): Response
    {
        return Inertia::render('Payments/Show', [
            'payment' => $payment,
        ]);
    }

    public function edit(Payment $payment): Response
    {
        return Inertia::render('Payments/Edit', [
            'payment' => $payment,
            'charges' => Charge::query()->orderBy('date')->get(),
        ]);
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'charge_id' => ['required', 'exists:charges,id'],
            'status' => ['required', Rule::in(['pending', 'validated'])],
            'payment_date' => ['nullable', 'date'],
        ]);

        $payment->update($validated);

        return redirect()->route('payments.index')->with('success', 'Payment updated successfully.');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $payment->delete();

        return redirect()->route('payments.index')->with('success', 'Payment deleted successfully.');
    }
}
