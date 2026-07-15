<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Announcement;
use App\Models\Building;
use App\Models\Charge;
use App\Models\Floor;
use App\Models\Organization;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_building_view_summary_uses_selected_building_counts(): void
    {
        $organization = $this->activeOrganization('dashboard-building-view');
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Syndic']);
        $residentA = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Locataire']);
        $coOwnerA = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $residentB = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Locataire']);
        [$buildingA, $buildingB] = Building::factory()->count(2)->create(['organization_id' => $organization->id]);
        $floorA = Floor::factory()->create(['organization_id' => $organization->id, 'building_id' => $buildingA->id]);
        $floorB = Floor::factory()->create(['organization_id' => $organization->id, 'building_id' => $buildingB->id]);

        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floorA->id, 'user_id' => $residentA->id]);
        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floorA->id, 'user_id' => $coOwnerA->id]);
        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floorA->id, 'user_id' => $residentA->id]);
        Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floorB->id, 'user_id' => $residentB->id]);

        $this->actingAs($admin)
            ->get(route('dashboard', ['building_id' => $buildingA->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('summary.users', 2)
                ->where('summary.buildings', 1)
                ->where('summary.apartments', 3)
            );
    }

    public function test_coproprietaire_dashboard_is_scoped_to_personal_lots(): void
    {
        $organization = $this->activeOrganization('dashboard-owner-view');
        $owner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $otherOwner = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Coproprietaire']);
        $building = Building::factory()->create(['organization_id' => $organization->id]);
        $floor = Floor::factory()->create(['organization_id' => $organization->id, 'building_id' => $building->id]);
        $apartment = Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floor->id, 'user_id' => $owner->id]);
        $otherApartment = Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floor->id, 'user_id' => $otherOwner->id]);

        Charge::factory()->create([
            'organization_id' => $organization->id,
            'apartment_id' => $apartment->id,
            'amount' => 500,
            'status' => 'pending',
            'date' => now(),
        ]);
        Charge::factory()->create([
            'organization_id' => $organization->id,
            'apartment_id' => $otherApartment->id,
            'amount' => 900,
            'status' => 'pending',
            'date' => now(),
        ]);

        $this->actingAs($owner)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('roleDashboard.role', 'Coproprietaire')
                ->where('roleDashboard.summary.lots', 1)
                ->where('roleDashboard.summary.balance', 500)
                ->where('roleDashboard.apartments.0.number', $apartment->number)
                ->where('roleDashboard.charges.0.apartment', $apartment->number)
            );
    }

    public function test_locataire_dashboard_keeps_restricted_surface(): void
    {
        $organization = $this->activeOrganization('dashboard-tenant-view');
        $tenant = User::factory()->create(['organization_id' => $organization->id, 'role' => 'Locataire']);
        $building = Building::factory()->create(['organization_id' => $organization->id]);
        $floor = Floor::factory()->create(['organization_id' => $organization->id, 'building_id' => $building->id]);
        $apartment = Apartment::factory()->create(['organization_id' => $organization->id, 'floor_id' => $floor->id, 'user_id' => $tenant->id]);

        Announcement::factory()->create([
            'organization_id' => $organization->id,
            'target_role' => 'all',
            'building_id' => $building->id,
        ]);
        Ticket::factory()->create([
            'organization_id' => $organization->id,
            'apartment_id' => $apartment->id,
            'assingned_by' => $tenant->id,
            'status' => 'open',
        ]);

        $this->actingAs($tenant)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('roleDashboard.role', 'Locataire')
                ->where('roleDashboard.summary.apartments', 1)
                ->where('roleDashboard.summary.announcements', 1)
                ->where('roleDashboard.summary.openTickets', 1)
                ->missing('roleDashboard.documents')
                ->missing('roleDashboard.charges')
            );
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
