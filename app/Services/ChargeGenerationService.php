<?php

namespace App\Services;

use App\Models\Building;
use App\Models\Charge;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ChargeGenerationService
{
    public function preview(Carbon $period, ?int $buildingId = null): array
    {
        $buildings = Building::query()
            ->when($buildingId, fn ($query) => $query->where('id', $buildingId))
            ->with('apartments')
            ->orderBy('name')
            ->get()
            ->map(fn (Building $building) => $this->previewBuilding($building, $period))
            ->values();

        return [
            'period' => $period->format('Y-m'),
            'period_label' => $period->format('m/Y'),
            'building_id' => $buildingId,
            'buildings' => $buildings,
            'totals' => [
                'buildings' => $buildings->count(),
                'expenses' => round((float) $buildings->sum('expenses'), 2),
                'existing_amount' => round((float) $buildings->sum('existing_amount'), 2),
                'apartments' => (int) $buildings->sum('apartments'),
                'existing_charges' => (int) $buildings->sum('existing_charges'),
                'will_create' => (int) $buildings->sum('will_create'),
                'skipped' => (int) $buildings->sum('skipped'),
                'total_amount' => round((float) $buildings->sum('total_amount'), 2),
            ],
        ];
    }

    public function generate(Carbon $period, ?int $buildingId = null): array
    {
        $created = 0;
        $skipped = 0;
        $generatedAmount = 0.0;
        $createdChargeIds = [];

        DB::transaction(function () use (
            $period,
            $buildingId,
            &$created,
            &$skipped,
            &$generatedAmount,
            &$createdChargeIds,
        ) {
            $buildings = Building::query()
                ->when($buildingId, fn ($query) => $query->where('id', $buildingId))
                ->with('apartments')
                ->get();

            foreach ($buildings as $building) {
                $expenses = $this->expensesFor($building, $period);
                $expenseTotal = $this->expenseTotal($expenses);
                $apartments = $building->apartments;
                $existingCharges = $this->existingChargesFor($apartments, $period);
                $targetAllocations = $this->targetAllocationsFor($apartments, $expenses);
                $allocations = $this->remainingAllocationsFor($targetAllocations, $existingCharges);

                if ($apartments->isEmpty() || $expenseTotal <= 0 || empty($allocations)) {
                    $skipped += $apartments->count();

                    continue;
                }

                foreach ($apartments as $apartment) {
                    $amount = $allocations[$apartment->id] ?? 0;

                    if ($amount <= 0) {
                        $skipped++;

                        continue;
                    }

                    $charge = Charge::create([
                        'description' => $existingCharges->has($apartment->id)
                            ? 'Ajustement charges '.$period->format('m/Y')
                            : 'Charges '.$period->format('m/Y'),
                        'amount' => $amount,
                        'date' => $period,
                        'apartment_id' => $apartment->id,
                        'status' => 'pending',
                    ]);

                    $created++;
                    $createdChargeIds[] = $charge->id;
                    $generatedAmount += $amount;
                }
            }
        });

        return [
            'period' => $period->format('Y-m'),
            'period_label' => $period->format('m/Y'),
            'building_id' => $buildingId,
            'created' => $created,
            'skipped' => $skipped,
            'total' => round($generatedAmount, 2),
            'created_charge_ids' => $createdChargeIds,
        ];
    }

    private function previewBuilding(Building $building, Carbon $period): array
    {
        $expenses = $this->expensesFor($building, $period);
        $expenseTotal = $this->expenseTotal($expenses);
        $apartments = $building->apartments;
        $existingCharges = $this->existingChargesFor($apartments, $period);
        $existingAmount = $this->existingAmount($existingCharges);
        $targetAllocations = $this->targetAllocationsFor($apartments, $expenses);
        $allocations = $this->remainingAllocationsFor($targetAllocations, $existingCharges);
        $willCreate = count($allocations);
        $skipped = $apartments->count() - $willCreate;
        $totalAmount = array_sum($allocations);
        $areaTotal = $apartments->sum(fn ($apartment) => (float) ($apartment->area ?? 0));

        return [
            'id' => $building->id,
            'name' => $building->name,
            'expenses' => round($expenseTotal, 2),
            'existing_amount' => round($existingAmount, 2),
            'apartments' => $apartments->count(),
            'total_area' => round($areaTotal, 2),
            'existing_charges' => $existingCharges->flatten(1)->count(),
            'will_create' => $willCreate,
            'skipped' => $skipped,
            'total_amount' => round($totalAmount, 2),
            'status' => $this->previewStatus($expenseTotal, $apartments->count(), $willCreate, $existingCharges->flatten(1)->count()),
        ];
    }

    private function existingChargesFor($apartments, Carbon $period)
    {
        $apartmentIds = $apartments->pluck('id');

        if ($apartmentIds->isEmpty()) {
            return collect();
        }

        return Charge::query()
            ->whereIn('apartment_id', $apartmentIds)
            ->whereYear('date', $period->year)
            ->whereMonth('date', $period->month)
            ->get(['apartment_id', 'amount'])
            ->groupBy('apartment_id');
    }

    private function existingAmount($existingCharges): float
    {
        return (float) $existingCharges
            ->flatten(1)
            ->sum(fn (Charge $charge) => (float) $charge->amount);
    }

    private function expensesFor(Building $building, Carbon $period)
    {
        return Expense::query()
            ->where('building_id', $building->id)
            ->whereYear('date', $period->year)
            ->whereMonth('date', $period->month)
            ->get(['id', 'amount', 'apartment_id']);
    }

    private function expenseTotal($expenses): float
    {
        return (float) $expenses->sum(fn (Expense $expense) => (float) $expense->amount);
    }

    private function targetAllocationsFor($apartments, $expenses): array
    {
        if ($apartments->isEmpty() || $expenses->isEmpty()) {
            return [];
        }

        $allocations = [];
        $apartmentIds = $apartments->pluck('id');
        $sharedExpenses = (float) $expenses
            ->filter(fn (Expense $expense) => $expense->apartment_id === null)
            ->sum(fn (Expense $expense) => (float) $expense->amount);

        foreach ($this->allocationsFor($apartments, $sharedExpenses) as $apartmentId => $amount) {
            $this->addAllocation($allocations, $apartmentId, $amount);
        }

        $expenses
            ->filter(fn (Expense $expense) => $expense->apartment_id !== null)
            ->filter(fn (Expense $expense) => $apartmentIds->contains($expense->apartment_id))
            ->groupBy('apartment_id')
            ->each(function ($apartmentExpenses, $apartmentId) use (&$allocations) {
                $this->addAllocation(
                    $allocations,
                    $apartmentId,
                    (float) $apartmentExpenses->sum(fn (Expense $expense) => (float) $expense->amount),
                );
            });

        return array_filter(
            array_map(fn (float $amount) => round($amount, 2), $allocations),
            fn (float $amount) => $amount > 0,
        );
    }

    private function remainingAllocationsFor(array $targetAllocations, $existingCharges): array
    {
        $allocations = [];

        foreach ($targetAllocations as $apartmentId => $targetAmount) {
            $remaining = round(
                max(0, (float) $targetAmount - $this->existingAmountForApartment($existingCharges, $apartmentId)),
                2,
            );

            if ($remaining > 0) {
                $allocations[$apartmentId] = $remaining;
            }
        }

        return $allocations;
    }

    private function existingAmountForApartment($existingCharges, int|string $apartmentId): float
    {
        $charges = $existingCharges->get($apartmentId)
            ?? $existingCharges->get((string) $apartmentId)
            ?? collect();

        return (float) collect($charges)->sum(fn (Charge $charge) => (float) $charge->amount);
    }

    private function addAllocation(array &$allocations, int|string $apartmentId, float $amount): void
    {
        if ($amount <= 0) {
            return;
        }

        $allocations[$apartmentId] = round(($allocations[$apartmentId] ?? 0) + $amount, 2);
    }

    private function amountForApartment(float $expenses, float $apartmentArea, float $areaTotal, int $apartmentCount): float
    {
        if ($areaTotal > 0) {
            return round($expenses * ($apartmentArea / $areaTotal), 2);
        }

        return round($expenses / max(1, $apartmentCount), 2);
    }

    private function allocationsFor($apartments, float $amount): array
    {
        $apartments = $apartments->sortBy('id')->values();
        $count = $apartments->count();

        if ($count === 0 || $amount <= 0) {
            return [];
        }

        $areaTotal = $apartments->sum(fn ($apartment) => (float) ($apartment->area ?? 0));
        $remaining = round($amount, 2);
        $allocations = [];

        foreach ($apartments as $index => $apartment) {
            $isLast = $index === $count - 1;
            $share = $isLast
                ? $remaining
                : $this->amountForApartment(
                    expenses: $amount,
                    apartmentArea: (float) ($apartment->area ?? 0),
                    areaTotal: $areaTotal,
                    apartmentCount: $count,
                );

            $share = round(min($share, $remaining), 2);

            if ($share > 0) {
                $allocations[$apartment->id] = $share;
                $remaining = round($remaining - $share, 2);
            }
        }

        return $allocations;
    }

    private function previewStatus(float $expenses, int $apartmentCount, int $willCreate, int $existingCharges): string
    {
        if ($apartmentCount === 0) {
            return 'Aucun appartement';
        }

        if ($expenses <= 0) {
            return 'Aucune dépense';
        }

        if ($willCreate === 0 && $existingCharges > 0) {
            return 'Déjà généré';
        }

        if ($willCreate > 0 && $existingCharges > 0) {
            return 'Ajustement à générer';
        }

        return 'Pret';
    }
}
