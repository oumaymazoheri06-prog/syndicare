<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Building;
use App\Models\Charge;
use App\Models\Expense;
use App\Models\Floor;
use App\Models\Notification;
use App\Models\Organization;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_announcement_notifies_targeted_building_residents(): void
    {
        $organization = $this->createActiveOrganization('notification-building-test');
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        $tenant = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Locataire']);
        $owner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $otherTenant = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Locataire']);
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

        Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'user_id' => $tenant->id,
        ]);
        Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'user_id' => $owner->id,
        ]);
        Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $otherFloor->id,
            'user_id' => $otherTenant->id,
        ]);

        $this->actingAs($admin)
            ->post(route('announcements.store'), [
                'title' => 'Ascenseur en maintenance',
                'content' => 'Intervention prevue demain matin.',
                'target_role' => 'locataires',
                'building_id' => $building->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $tenant->id,
            'title' => 'Nouvelle annonce',
            'type' => 'info',
            'is_read' => false,
        ]);
        $this->assertDatabaseMissing('notifications', ['user_id' => $owner->id]);
        $this->assertDatabaseMissing('notifications', ['user_id' => $otherTenant->id]);
    }

    public function test_found_item_notifies_residents(): void
    {
        $organization = $this->createActiveOrganization('notification-item-test');
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        $tenant = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Locataire']);
        $owner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);

        $this->actingAs($admin)
            ->post(route('items.store'), [
                'title' => 'Cle trouvee',
                'category' => 'Cles',
                'description' => 'Cle trouvee dans le hall.',
                'location' => 'Hall',
                'date' => '2026-05-13',
                'type' => 'Trouve',
                'apartment_id' => null,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $tenant->id,
            'title' => 'Objet trouvé déclaré',
            'type' => 'info',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'title' => 'Objet trouvé déclaré',
            'type' => 'info',
        ]);
    }

    public function test_generated_charges_notify_only_coproprietaires(): void
    {
        $organization = $this->createActiveOrganization('notification-charge-test');
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        $tenant = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Locataire']);
        $owner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $building = Building::factory()->create(['organization_id' => $organization->id]);
        $floor = Floor::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
        ]);

        Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'user_id' => $tenant->id,
            'area' => 40,
        ]);
        Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'user_id' => $owner->id,
            'area' => 60,
        ]);
        Expense::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
            'amount' => 1000,
            'date' => '2026-05-13',
        ]);

        $this->actingAs($admin)
            ->post(route('dashboard.generate-charges'), [
                'month' => '2026-05',
                'building_id' => $building->id,
            ])
            ->assertRedirect(route('dashboard', ['building_id' => $building->id]));

        $this->assertSame(1, Notification::query()->where('title', 'Nouvelles charges')->count());
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $tenant->id,
            'title' => 'Nouvelles charges',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'title' => 'Nouvelles charges',
            'type' => 'warning',
        ]);
    }

    public function test_manual_charge_does_not_notify_locataire(): void
    {
        $organization = $this->createActiveOrganization('notification-manual-charge-test');
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        $tenant = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Locataire']);
        $building = Building::factory()->create(['organization_id' => $organization->id]);
        $floor = Floor::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
        ]);
        $apartment = Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'user_id' => $tenant->id,
        ]);

        $this->actingAs($admin)
            ->post(route('charges.store'), [
                'description' => 'Charge exceptionnelle',
                'amount' => 250,
                'date' => '2026-05-20',
                'apartment_id' => $apartment->id,
            ])
            ->assertRedirect(route('charges.index'));

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $tenant->id,
            'title' => 'Nouvelle charge',
        ]);
    }

    public function test_validating_payment_notifies_the_payer(): void
    {
        $organization = $this->createActiveOrganization('syndicare-payment-test');
        $admin = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => 'Syndic',
        ]);
        $owner = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => 'Coproprietaire',
        ]);
        $building = Building::factory()->create(['organization_id' => $organization->id]);
        $floor = Floor::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
        ]);
        $apartment = Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'user_id' => $owner->id,
            'number' => 'A-12',
        ]);
        $charge = Charge::factory()->create([
            'organization_id' => $organization->id,
            'apartment_id' => $apartment->id,
            'description' => 'Charges juin',
            'amount' => 350,
            'status' => 'pending',
        ]);
        $payment = Payment::factory()->create([
            'organization_id' => $organization->id,
            'charge_id' => $charge->id,
            'user_id' => $owner->id,
            'amount' => 350,
            'status' => 'pending',
            'payment_date' => null,
        ]);

        $this->actingAs($admin)
            ->patch(route('payments.status.update', $payment), ['status' => 'validated'])
            ->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'title' => 'Paiement validé',
            'type' => 'info',
            'is_read' => false,
        ]);
        $this->assertDatabaseHas('charges', [
            'id' => $charge->id,
            'status' => 'paid',
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
