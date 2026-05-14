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
                $apartments = $building->apartments;
                $existingCharges = $this->existingChargesFor($apartments, $period);
                $existingAmount = $this->existingAmount($existingCharges);
                $remainingAmount = round(max(0, $expenses - $existingAmount), 2);
                $targetApartments = $this->targetApartments($apartments, $existingCharges, $remainingAmount);
                $allocations = $this->allocationsFor($targetApartments, $remainingAmount);

                if ($apartments->isEmpty() || $expenses <= 0 || empty($allocations)) {
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
        $apartments = $building->apartments;
        $existingCharges = $this->existingChargesFor($apartments, $period);
        $existingAmount = $this->existingAmount($existingCharges);
        $remainingAmount = round(max(0, $expenses - $existingAmount), 2);
        $targetApartments = $this->targetApartments($apartments, $existingCharges, $remainingAmount);
        $allocations = $this->allocationsFor($targetApartments, $remainingAmount);
        $willCreate = count($allocations);
        $skipped = $apartments->count() - $willCreate;
        $totalAmount = array_sum($allocations);
        $areaTotal = $apartments->sum(fn ($apartment) => (float) ($apartment->area ?? 0));

        return [
            'id' => $building->id,
            'name' => $building->name,
            'expenses' => round($expenses, 2),
            'existing_amount' => round($existingAmount, 2),
            'apartments' => $apartments->count(),
            'total_area' => round($areaTotal, 2),
            'existing_charges' => $existingCharges->flatten(1)->count(),
            'will_create' => $willCreate,
            'skipped' => $skipped,
            'total_amount' => round($totalAmount, 2),
            'status' => $this->previewStatus($expenses, $apartments->count(), $willCreate, $existingCharges->flatten(1)->count()),
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

    private function targetApartments($apartments, $existingCharges, float $remainingAmount)
    {
        if ($remainingAmount <= 0 || $apartments->isEmpty()) {
            return collect();
        }

        $existingApartmentIds = $existingCharges->keys();

        if ($existingApartmentIds->isEmpty()) {
            return $apartments->values();
        }

        if ($existingApartmentIds->count() < $apartments->count()) {
            return $apartments
                ->reject(fn ($apartment) => $existingApartmentIds->contains($apartment->id))
                ->values();
        }

        return $apartments->values();
    }

    private function expensesFor(Building $building, Carbon $period): float
    {
        return (float) Expense::query()
            ->where('building_id', $building->id)
            ->whereYear('date', $period->year)
            ->whereMonth('date', $period->month)
            ->sum('amount');
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
            return 'Aucune depense';
        }

        if ($willCreate === 0 && $existingCharges > 0) {
            return 'Deja genere';
        }

        if ($willCreate > 0 && $existingCharges > 0) {
            return 'Ajustement a generer';
        }

        return 'Pret';
    }
}
