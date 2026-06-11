<?php

namespace App\Http\Controllers;

use App\Models\Audit_log;
use App\Models\Apartment;
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
            'expenses' => Expense::query()
                ->with(['building', 'apartment'])
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Expenses/Create', [
            'buildings' => $this->buildingOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'building_id' => ['required', $this->tenantExists('buildings')],
            'apartment_id' => ['nullable', $this->tenantExists('apartments')],
        ]);

        if (! $this->apartmentBelongsToBuilding($validated['apartment_id'] ?? null, $validated['building_id'])) {
            return back()
                ->withErrors(['apartment_id' => 'Ce lot n appartient pas a cet immeuble.'])
                ->withInput();
        }

        Expense::create($validated);
Audit_log::create([
            'action' => 'Creation de dépense',
            'details' => 'Une dépense intitulée "' . $validated['title'] . '" a été créée pour le bâtiment ID ' . $validated['building_id'] . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('expenses.index')->with('success', 'Expense created successfully.');
    }

    public function show(Expense $expense): Response
    {
        return Inertia::render('Expenses/Show', [
            'expense' => $expense->load(['building', 'apartment']),
        ]);
    }

    public function edit(Expense $expense): Response
    {
        return Inertia::render('Expenses/Edit', [
            'expense' => $expense->load(['building', 'apartment']),
            'buildings' => $this->buildingOptions(),
        ]);
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'building_id' => ['required', $this->tenantExists('buildings')],
            'apartment_id' => ['nullable', $this->tenantExists('apartments')],
        ]);

        if (! $this->apartmentBelongsToBuilding($validated['apartment_id'] ?? null, $validated['building_id'])) {
            return back()
                ->withErrors(['apartment_id' => 'Ce lot n appartient pas a cet immeuble.'])
                ->withInput();
        }

        $expense->update($validated);
Audit_log::create([
            'action' => 'Mise à jour de dépense',
            'details' => 'La dépense ID '.$expense->id.' a été mise à jour en "' . $validated['title'] . '" pour le bâtiment ID ' . $validated['building_id'] . '.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('expenses.index')->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $expense->delete();
Audit_log::create([
            'action' => 'Suppression de dépense',
            'details' => 'La dépense ID '.$expense->id.' a été supprimée.',
            'performed_by' => auth()->id(),
        ]);

        
        return redirect()->route('expenses.index')->with('success', 'Expense deleted successfully.');
    }

    private function buildingOptions()
    {
        return Building::query()
            ->with(['apartments' => fn ($query) => $query->orderBy('number')])
            ->orderBy('name')
            ->get();
    }

    private function apartmentBelongsToBuilding(?int $apartmentId, int|string $buildingId): bool
    {
        if (! $apartmentId) {
            return true;
        }

        return Apartment::query()
            ->whereKey($apartmentId)
            ->whereHas('floor', fn ($query) => $query->where('building_id', $buildingId))
            ->exists();
    }
}
