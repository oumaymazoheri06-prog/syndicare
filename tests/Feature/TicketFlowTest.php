<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Building;
use App\Models\Floor;
use App\Models\Notification;
use App\Models\Organization;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_resident_creates_ticket_with_only_title_and_description(): void
    {
        [$syndic, $resident, $apartment] = $this->ticketContext('Locataire');

        $this->actingAs($resident)
            ->post(route('tickets.store'), [
                'title' => 'Fuite d eau',
                'description' => 'Probleme de fuite dans la cuisine.',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('tickets.index'));

        $ticket = Ticket::query()->firstOrFail();

        $this->assertSame('Fuite d eau', $ticket->title);
        $this->assertSame('open', $ticket->status);
        $this->assertNull($ticket->assigned_to);
        $this->assertSame($resident->id, $ticket->assingned_by);
        $this->assertSame($apartment->id, $ticket->apartment_id);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $syndic->id,
            'title' => 'Nouveau ticket',
            'type' => 'warning',
        ]);
    }

    public function test_syndic_cannot_create_ticket_from_resident_form(): void
    {
        [$syndic] = $this->ticketContext();

        $this->actingAs($syndic)
            ->get(route('tickets.create'))
            ->assertForbidden();
    }

    public function test_syndic_receives_ticket_with_resident_and_lot_context(): void
    {
        [$syndic, $resident, $apartment] = $this->ticketContext('Coproprietaire');

        $ticket = Ticket::factory()->create([
            'organization_id' => $syndic->organization_id,
            'title' => 'Ascenseur bloque',
            'description' => 'Ascenseur arrete au rez-de-chaussee.',
            'assingned_by' => $resident->id,
            'assigned_to' => null,
            'apartment_id' => $apartment->id,
            'status' => 'open',
        ]);

        $this->actingAs($syndic)
            ->get(route('tickets.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Tickets/Index')
                ->where('tickets.data.0.id', $ticket->id)
                ->where('tickets.data.0.resident_label', $resident->name)
                ->where('tickets.data.0.apartment_label', 'Lot '.$apartment->number)
            );
    }

    private function ticketContext(string $residentRole = 'Locataire'): array
    {
        $organization = Organization::create([
            'name' => 'Syndicare Test',
            'slug' => 'syndicare-test',
            'plan' => 'standard',
            'subscription_status' => 'active',
        ]);

        $syndic = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => 'Syndic',
        ]);
        $resident = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => $residentRole,
        ]);
        $building = Building::factory()->create([
            'organization_id' => $organization->id,
        ]);
        $floor = Floor::factory()->create([
            'organization_id' => $organization->id,
            'building_id' => $building->id,
        ]);
        $apartment = Apartment::factory()->create([
            'organization_id' => $organization->id,
            'floor_id' => $floor->id,
            'user_id' => $resident->id,
            'number' => 'A-101',
        ]);

        Notification::query()->delete();

        return [$syndic, $resident, $apartment];
    }
}
