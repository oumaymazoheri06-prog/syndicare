<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Expense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Expenses/Index', [
            'expenses' => Expense::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Expenses/Create', [
            'buildings' => Building::query()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'building_id' => ['required', 'exists:buildings,id'],
        ]);

        Expense::create($validated);

        return redirect()->route('expenses.index')->with('success', 'Expense created successfully.');
    }

    public function show(Expense $expense): Response
    {
        return Inertia::render('Expenses/Show', [
            'expense' => $expense,
        ]);
    }

    public function edit(Expense $expense): Response
    {
        return Inertia::render('Expenses/Edit', [
            'expense' => $expense,
            'buildings' => Building::query()->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'building_id' => ['required', 'exists:buildings,id'],
        ]);

        $expense->update($validated);

        return redirect()->route('expenses.index')->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $expense->delete();

        return redirect()->route('expenses.index')->with('success', 'Expense deleted successfully.');
    }
}
