<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Receipt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReceiptController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Receipts/Index', [
            'receipts' => Receipt::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Receipts/Create', [
            'payments' => Payment::query()->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file_path' => ['required', 'string', 'max:255'],
            'payment_id' => ['required', 'exists:payments,id'],
        ]);

        Receipt::create($validated);

        return redirect()->route('receipts.index')->with('success', 'Receipt created successfully.');
    }

    public function show(Receipt $receipt): Response
    {
        return Inertia::render('Receipts/Show', [
            'receipt' => $receipt,
        ]);
    }

    public function edit(Receipt $receipt): Response
    {
        return Inertia::render('Receipts/Edit', [
            'receipt' => $receipt,
            'payments' => Payment::query()->latest()->get(),
        ]);
    }

    public function update(Request $request, Receipt $receipt): RedirectResponse
    {
        $validated = $request->validate([
            'file_path' => ['required', 'string', 'max:255'],
            'payment_id' => ['required', 'exists:payments,id'],
        ]);

        $receipt->update($validated);

        return redirect()->route('receipts.index')->with('success', 'Receipt updated successfully.');
    }

    public function destroy(Receipt $receipt): RedirectResponse
    {
        $receipt->delete();

        return redirect()->route('receipts.index')->with('success', 'Receipt deleted successfully.');
    }
}
