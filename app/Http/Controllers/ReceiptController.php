<?php

namespace App\Http\Controllers;

use App\Models\Audit_log;
use App\Models\Payment;
use App\Models\Receipt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReceiptController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Receipt::class);

        $query = Receipt::query()->with('payment.charge.apartment')->latest();

        if ($request->user()->role !== 'Syndic') {
            $query->whereHas('payment.charge.apartment', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        }

        return Inertia::render('Receipts/Index', [
            'receipts' => $query->paginate(10),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Receipt::class);

        return Inertia::render('Receipts/Create', [
            'payments' => Payment::query()->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Receipt::class);

        $validated = $request->validate([
            'file_path' => ['required', 'string', 'max:255'],
            'payment_id' => ['required', $this->tenantExists('payments')],
        ]);

        Receipt::create($validated);
Audit_log::create([
    'action' => 'Création de reçu',
    'details' => 'Un reçu pour le paiement ID '.$validated['payment_id'].' a été créé.',
    'performed_by' => auth()->id(),
]);
        return redirect()->route('receipts.index')->with('success', 'Reçu créé avec succès.');
    }

    public function show(Receipt $receipt): Response
    {
        $this->authorize('view', $receipt);

        return Inertia::render('Receipts/Show', [
            'receipt' => $receipt,
        ]);
    }

    public function edit(Receipt $receipt): Response
    {
        $this->authorize('update', $receipt);

        return Inertia::render('Receipts/Edit', [
            'receipt' => $receipt,
            'payments' => Payment::query()->latest()->get(),
        ]);
    }

    public function update(Request $request, Receipt $receipt): RedirectResponse
    {
        $this->authorize('update', $receipt);

        $validated = $request->validate([
            'file_path' => ['required', 'string', 'max:255'],
            'payment_id' => ['required', $this->tenantExists('payments')],
        ]);

        $receipt->update($validated);

        Audit_log::create([
            'action' => 'Mise à jour de reçu',
            'details' => 'Le reçu pour le paiement ID '.$validated['payment_id'].' a été mis à jour.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('receipts.index')->with('success', 'Reçu mis à jour avec succès.');
    }

    public function destroy(Receipt $receipt): RedirectResponse
    {
        $this->authorize('delete', $receipt);

        $receipt->delete();
        Audit_log::create([
            'action' => 'Suppression de reçu',
            'details' => 'Le reçu pour le paiement ID '.$receipt->payment_id.' a été supprimé.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('receipts.index')->with('success', 'Reçu supprimé avec succès.');
    }
}
