<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Building;
use App\Models\Charge;
use App\Models\Expense;
use App\Models\Floor;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChargeGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_syndic_can_preview_and_generate_charges_for_all_buildings(): void
    {
        $organization = $this->activeOrganization('charge-generation-all');
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        [$buildingA, $buildingB] = Building::factory()->count(2)->create(['organization_id' => $organization->id]);
        $floorA = Floor::factory()->create(['organization_id' => $organization->id, 'building_id' => $buildingA->id]);
        $floorB = Floor::factory()->create(['organization_id' => $organization->id, 'building_id' => $buildingB->id]);

        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floorA->id, 'area' => 40]);
        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floorA->id, 'area' => 60]);
        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floorB->id, 'area' => 50]);

        Expense::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $buildingA->id,
            'amount' => 1000,
            'date' => '2026-05-10',
        ]);
        Expense::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $buildingB->id,
            'amount' => 500,
            'date' => '2026-05-10',
        ]);

        $this->actingAs($admin)
            ->getJson(route('dashboard.charges-preview', ['month' => '2026-05']))
            ->assertOk()
            ->assertJsonPath('totals.buildings', 2)
            ->assertJsonPath('totals.will_create', 3)
            ->assertJsonPath('totals.total_amount', 1500);

        $this->actingAs($admin)
            ->post(route('dashboard.generate-charges'), ['month' => '2026-05'])
            ->assertRedirect(route('dashboard'));

        $this->assertSame(3, Charge::count());
        $this->assertSame(1500.0, (float) Charge::sum('amount'));
    }

    public function test_syndic_can_preview_and_generate_charges_for_one_building_without_duplicates(): void
    {
        $organization = $this->activeOrganization('charge-generation-one-building');
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        [$buildingA, $buildingB] = Building::factory()->count(2)->create(['organization_id' => $organization->id]);
        $floorA = Floor::factory()->create(['organization_id' => $organization->id, 'building_id' => $buildingA->id]);
        $floorB = Floor::factory()->create(['organization_id' => $organization->id, 'building_id' => $buildingB->id]);

        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floorA->id, 'area' => 40]);
        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floorA->id, 'area' => 60]);
        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floorB->id, 'area' => 50]);

        Expense::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $buildingA->id,
            'amount' => 1000,
            'date' => '2026-05-10',
        ]);
        Expense::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $buildingB->id,
            'amount' => 500,
            'date' => '2026-05-10',
        ]);

        $this->actingAs($admin)
            ->getJson(route('dashboard.charges-preview', [
                'month' => '2026-05',
                'building_id' => $buildingA->id,
            ]))
            ->assertOk()
            ->assertJsonPath('totals.will_create', 2)
            ->assertJsonPath('totals.total_amount', 1000);

        $this->actingAs($admin)
            ->post(route('dashboard.generate-charges'), [
                'month' => '2026-05',
                'building_id' => $buildingA->id,
            ])
            ->assertRedirect(route('dashboard', ['building_id' => $buildingA->id]));

        $this->assertSame(2, Charge::count());
        $this->assertSame(1000.0, (float) Charge::sum('amount'));

        $this->actingAs($admin)
            ->post(route('dashboard.generate-charges'), [
                'month' => '2026-05',
                'building_id' => $buildingA->id,
            ])
            ->assertRedirect(route('dashboard', ['building_id' => $buildingA->id]));

        $this->assertSame(2, Charge::count());

        $this->actingAs($admin)
            ->getJson(route('dashboard.charges-preview', [
                'month' => '2026-05',
                'building_id' => $buildingA->id,
            ]))
            ->assertOk()
            ->assertJsonPath('totals.will_create', 0)
            ->assertJsonPath('totals.skipped', 2);
    }

    public function test_generation_creates_only_adjustments_when_new_expenses_are_added_after_generation(): void
    {
        $organization = $this->activeOrganization('charge-generation-adjustments');
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        $building = Building::factory()->create(['organization_id' => $organization->id]);
        $floor = Floor::factory()->create(['organization_id' => $organization->id, 'building_id' => $building->id]);

        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floor->id, 'area' => 40]);
        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floor->id, 'area' => 60]);

        Expense::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
            'amount' => 1000,
            'date' => '2026-05-10',
        ]);

        $this->actingAs($admin)
            ->post(route('dashboard.generate-charges'), [
                'month' => '2026-05',
                'building_id' => $building->id,
            ]);

        Expense::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
            'amount' => 250,
            'date' => '2026-05-20',
        ]);

        $this->actingAs($admin)
            ->getJson(route('dashboard.charges-preview', [
                'month' => '2026-05',
                'building_id' => $building->id,
            ]))
            ->assertOk()
            ->assertJsonPath('totals.will_create', 2)
            ->assertJsonPath('totals.existing_amount', 1000)
            ->assertJsonPath('totals.total_amount', 250)
            ->assertJsonPath('buildings.0.status', 'Ajustement à générer');

        $this->actingAs($admin)
            ->post(route('dashboard.generate-charges'), [
                'month' => '2026-05',
                'building_id' => $building->id,
            ]);

        $this->assertSame(4, Charge::count());
        $this->assertSame(1250.0, (float) Charge::sum('amount'));

        $this->actingAs($admin)
            ->post(route('dashboard.generate-charges'), [
                'month' => '2026-05',
                'building_id' => $building->id,
            ]);

        $this->assertSame(4, Charge::count());
    }

    public function test_preview_reconciles_partial_existing_charges_at_building_total_level(): void
    {
        $organization = $this->activeOrganization('charge-generation-partial-existing');
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        $building = Building::factory()->create(['organization_id' => $organization->id]);
        $floor = Floor::factory()->create(['organization_id' => $organization->id, 'building_id' => $building->id]);
        $apartments = Apartment::factory()->count(4)->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'area' => 50,
        ]);

        Expense::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
            'amount' => 3169,
            'date' => '2026-05-10',
        ]);

        Charge::factory()->create([
            'organization_id' => $organization->id,
            'apartment_id' => $apartments[0]->id,
            'amount' => 529,
            'date' => '2026-05-01',
            'status' => 'pending',
        ]);
        Charge::factory()->create([
            'organization_id' => $organization->id,
            'apartment_id' => $apartments[1]->id,
            'amount' => 529,
            'date' => '2026-05-01',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->getJson(route('dashboard.charges-preview', [
                'month' => '2026-05',
                'building_id' => $building->id,
            ]))
            ->assertOk()
            ->assertJsonPath('totals.existing_charges', 2)
            ->assertJsonPath('totals.existing_amount', 1058)
            ->assertJsonPath('totals.total_amount', 2111)
            ->assertJsonPath('totals.will_create', 4);
    }

    private function activeOrganization(string $slug): Organization
    {
        return Organization::create([
            'name' => 'Syndicare Test',
            'slug' => $slug.'-'.str()->random(6),
            'plan' => 'standard',
            'subscription_status' => 'active',
        ]);
    }
}
