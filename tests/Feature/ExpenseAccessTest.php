<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Building;
use App\Models\Expense;
use App\Models\Floor;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExpenseAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_coproprietaire_sees_only_shared_and_personal_expenses_without_management_actions(): void
    {
        $organization = $this->createActiveOrganization('expense-owner-access');
        $syndic = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        $owner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $otherOwner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $building = Building::factory()->create(['organization_id' => $organization->id]);
        $floor = Floor::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
        ]);
        $ownerApartment = Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'user_id' => $owner->id,
        ]);
        $otherApartment = Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'user_id' => $otherOwner->id,
        ]);
        $sharedExpense = Expense::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
            'apartment_id' => null,
        ]);
        $personalExpense = Expense::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
            'apartment_id' => $ownerApartment->id,
        ]);
        $otherExpense = Expense::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
            'apartment_id' => $otherApartment->id,
        ]);

        $this->actingAs($owner)
            ->get(route('expenses.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Expenses/Index')
                ->has('expenses.data', 2)
                ->where('expenses.data', function ($expenses) use ($sharedExpense, $personalExpense) {
                    return collect($expenses)->pluck('id')->sort()->values()->all()
                        === collect([$sharedExpense->id, $personalExpense->id])->sort()->values()->all();
                }));

        $this->actingAs($owner)->get(route('expenses.show', $sharedExpense))->assertOk();
        $this->actingAs($owner)->get(route('expenses.show', $personalExpense))->assertOk();
        $this->actingAs($owner)->get(route('expenses.show', $otherExpense))->assertForbidden();
        $this->actingAs($owner)->get(route('expenses.create'))->assertForbidden();
        $this->actingAs($owner)->get(route('expenses.edit', $personalExpense))->assertForbidden();
        $this->actingAs($owner)->delete(route('expenses.destroy', $personalExpense))->assertForbidden();

        $this->assertDatabaseHas('expenses', ['id' => $personalExpense->id]);
        $this->actingAs($syndic)->get(route('expenses.edit', $personalExpense))->assertOk();
    }

    public function test_locataire_cannot_access_expenses(): void
    {
        $organization = $this->createActiveOrganization('expense-tenant-access');
        $tenant = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Locataire']);

        $this->actingAs($tenant)->get(route('expenses.index'))->assertForbidden();
    }

    public function test_shared_expense_notifies_coproprietaires_of_the_building_only(): void
    {
        $organization = $this->createActiveOrganization('expense-notification');
        $syndic = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        $owner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $secondOwner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $otherOwner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $tenant = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Locataire']);
        [$building, $otherBuilding] = Building::factory()->count(2)->create([
            'organization_id' => $organization->id,
        ]);
        $floor = Floor::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
        ]);
        $otherFloor = Floor::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $otherBuilding->id,
        ]);

        foreach ([$owner, $secondOwner, $tenant] as $resident) {
            Apartment::factory()->create([
                'organization_id' => $organization->id,
                'floor_id' => $floor->id,
                'user_id' => $resident->id,
            ]);
        }

        Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $otherFloor->id,
            'user_id' => $otherOwner->id,
        ]);

        $this->actingAs($syndic)
            ->post(route('expenses.store'), [
                'title' => 'Entretien ascenseur',
                'description' => 'Maintenance préventive annuelle',
                'amount' => 1800,
                'date' => '2026-07-03',
                'building_id' => $building->id,
                'apartment_id' => null,
            ])
            ->assertRedirect(route('expenses.index'));

        foreach ([$owner, $secondOwner] as $recipient) {
            $this->assertDatabaseHas('notifications', [
                'user_id' => $recipient->id,
                'title' => 'Nouvelle dépense',
                'type' => 'info',
                'is_read' => false,
            ]);
        }

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $otherOwner->id,
            'title' => 'Nouvelle dépense',
        ]);
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $tenant->id,
            'title' => 'Nouvelle dépense',
        ]);
    }

    public function test_expense_for_one_lot_notifies_only_its_coproprietaire(): void
    {
        $organization = $this->createActiveOrganization('expense-target-notification');
        $syndic = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        $owner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $otherOwner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $building = Building::factory()->create(['organization_id' => $organization->id]);
        $floor = Floor::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
        ]);
        $ownerApartment = Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'user_id' => $owner->id,
        ]);
        Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'user_id' => $otherOwner->id,
        ]);

        $this->actingAs($syndic)
            ->post(route('expenses.store'), [
                'title' => 'Réparation privative',
                'description' => 'Intervention sur le lot',
                'amount' => 450,
                'date' => '2026-07-03',
                'building_id' => $building->id,
                'apartment_id' => $ownerApartment->id,
            ])
            ->assertRedirect(route('expenses.index'));

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'title' => 'Nouvelle dépense',
        ]);
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $otherOwner->id,
            'title' => 'Nouvelle dépense',
        ]);
    }

    private function createActiveOrganization(string $slug): Organization
    {
        return Organization::create([
            'name' => 'Syndicare Test',
            'slug' => $slug,
            'plan' => 'standard',
            'subscription_status' => 'active',
        ]);
    }
}
