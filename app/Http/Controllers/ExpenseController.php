<?php

namespace App\Http\Controllers;

use App\Models\Audit_log;
use App\Models\Apartment;
use App\Models\Building;
use App\Models\Expense;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Expense::class);

        $query = Expense::query()
            ->with(['building', 'apartment'])
            ->latest();

        if ($request->user()->role === 'Coproprietaire') {
            $apartments = $request->user()
                ->apartments()
                ->with('floor:id,building_id')
                ->get(['id', 'floor_id']);
            $apartmentIds = $apartments->pluck('id');
            $buildingIds = $apartments
                ->pluck('floor.building_id')
                ->filter()
                ->unique()
                ->values();

            $query->where(function ($query) use ($apartmentIds, $buildingIds) {
                $query->whereIn('apartment_id', $apartmentIds)
                    ->orWhere(function ($query) use ($buildingIds) {
                        $query->whereNull('apartment_id')
                            ->whereIn('building_id', $buildingIds);
                    });
            });
        }

        return Inertia::render('Expenses/Index', [
            'expenses' => $query->paginate(10),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Expense::class);

        return Inertia::render('Expenses/Create', [
            'buildings' => $this->buildingOptions(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $this->authorize('create', Expense::class);

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
                ->withErrors(['apartment_id' => "Ce lot n'appartient pas à cet immeuble."])
                ->withInput();
        }

        $expense = Expense::create($validated);
        $expense->load(['building', 'apartment']);

        $this->notifyCoproprietaires($expense, $notifications);

Audit_log::create([
            'action' => 'Création de dépense',
            'details' => 'Une dépense intitulée "' . $validated['title'] . '" a été créée pour le bâtiment ID ' . $validated['building_id'] . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('expenses.index')->with('success', 'Dépense créée avec succès.');
    }

    public function show(Expense $expense): Response
    {
        $this->authorize('view', $expense);

        return Inertia::render('Expenses/Show', [
            'expense' => $expense->load(['building', 'apartment']),
        ]);
    }

    public function edit(Expense $expense): Response
    {
        $this->authorize('update', $expense);

        return Inertia::render('Expenses/Edit', [
            'expense' => $expense->load(['building', 'apartment']),
            'buildings' => $this->buildingOptions(),
        ]);
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        $this->authorize('update', $expense);

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
                ->withErrors(['apartment_id' => "Ce lot n'appartient pas à cet immeuble."])
                ->withInput();
        }

        $expense->update($validated);
Audit_log::create([
            'action' => 'Mise à jour de dépense',
            'details' => 'La dépense ID '.$expense->id.' a été mise à jour en "' . $validated['title'] . '" pour le bâtiment ID ' . $validated['building_id'] . '.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('expenses.index')->with('success', 'Dépense mise à jour avec succès.');
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        $this->authorize('delete', $expense);

        $expense->delete();
Audit_log::create([
            'action' => 'Suppression de dépense',
            'details' => 'La dépense ID '.$expense->id.' a été supprimée.',
            'performed_by' => auth()->id(),
        ]);

        
        return redirect()->route('expenses.index')->with('success', 'Dépense supprimée avec succès.');
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

    private function notifyCoproprietaires(Expense $expense, NotificationService $notifications): void
    {
        $recipients = User::query()
            ->where('organization_id', $expense->organization_id)
            ->where('role', 'Coproprietaire')
            ->whereHas('apartments', function ($query) use ($expense) {
                if ($expense->apartment_id) {
                    $query->whereKey($expense->apartment_id);

                    return;
                }

                $query->whereHas('floor', fn ($query) => $query->where('building_id', $expense->building_id));
            })
            ->get();

        $target = $expense->apartment
            ? 'le lot '.($expense->apartment->number ?: '#'.$expense->apartment->id)
            : "l'immeuble ".($expense->building?->name ?: '#'.$expense->building_id);

        $notifications->createForUsers(
            $recipients,
            'Nouvelle dépense',
            sprintf(
                'Le syndic a ajouté la dépense « %s » de %s MAD pour %s.',
                $expense->title,
                number_format((float) $expense->amount, 2, ',', ' '),
                $target
            ),
            'info'
        );
    }
}
