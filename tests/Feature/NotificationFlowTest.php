<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Building;
use App\Models\Expense;
use App\Models\Floor;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_announcement_notifies_targeted_building_residents(): void
    {
        $admin = User::factory()->create(['role' => 'Syndic']);
        $tenant = User::factory()->create(['role' => 'Locataire']);
        $owner = User::factory()->create(['role' => 'Coproprietaire']);
        $otherTenant = User::factory()->create(['role' => 'Locataire']);
        [$building, $otherBuilding] = Building::factory()->count(2)->create();
        $floor = Floor::factory()->create(['building_id' => $building->id]);
        $otherFloor = Floor::factory()->create(['building_id' => $otherBuilding->id]);

        Apartment::factory()->create(['floor_id' => $floor->id, 'user_id' => $tenant->id]);
        Apartment::factory()->create(['floor_id' => $floor->id, 'user_id' => $owner->id]);
        Apartment::factory()->create(['floor_id' => $otherFloor->id, 'user_id' => $otherTenant->id]);

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
        $admin = User::factory()->create(['role' => 'Syndic']);
        $tenant = User::factory()->create(['role' => 'Locataire']);
        $owner = User::factory()->create(['role' => 'Coproprietaire']);

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
            'title' => 'Objet trouve declare',
            'type' => 'info',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'title' => 'Objet trouve declare',
            'type' => 'info',
        ]);
    }

    public function test_generated_charges_notify_apartment_users(): void
    {
        $admin = User::factory()->create(['role' => 'Syndic']);
        $tenant = User::factory()->create(['role' => 'Locataire']);
        $owner = User::factory()->create(['role' => 'Coproprietaire']);
        $building = Building::factory()->create();
        $floor = Floor::factory()->create(['building_id' => $building->id]);

        Apartment::factory()->create(['floor_id' => $floor->id, 'user_id' => $tenant->id, 'area' => 40]);
        Apartment::factory()->create(['floor_id' => $floor->id, 'user_id' => $owner->id, 'area' => 60]);
        Expense::factory()->create([
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

        $this->assertSame(2, Notification::query()->where('title', 'Nouvelles charges')->count());
        $this->assertDatabaseHas('notifications', [
            'user_id' => $tenant->id,
            'title' => 'Nouvelles charges',
            'type' => 'warning',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'title' => 'Nouvelles charges',
            'type' => 'warning',
        ]);
    }
}
