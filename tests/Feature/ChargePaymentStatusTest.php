<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Building;
use App\Models\Charge;
use App\Models\Floor;
use App\Models\Organization;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChargePaymentStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_syndic_can_mark_charge_as_paid_and_create_validated_payment(): void
    {
        [$admin, $owner, $charge] = $this->chargeContext();

        $this->actingAs($admin)
            ->patch(route('charges.status.update', $charge), ['paid' => true])
            ->assertRedirect();

        $this->assertDatabaseHas('charges', [
            'id' => $charge->id,
            'status' => 'paid',
        ]);
        $this->assertDatabaseHas('payments', [
            'charge_id' => $charge->id,
            'user_id' => $owner->id,
            'status' => 'validated',
            'method' => 'manuel',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'Validation de charge',
            'performed_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'Création de paiement',
            'performed_by' => $admin->id,
        ]);
    }

    public function test_charge_form_cannot_bypass_payment_flow_by_posting_paid_status(): void
    {
        [$admin, $owner, , $apartment] = $this->chargeContext();

        $this->actingAs($admin)
            ->post(route('charges.store'), [
                'description' => 'Charge forcee',
                'amount' => 200,
                'date' => now()->toDateString(),
                'apartment_id' => $apartment->id,
                'status' => 'paid',
            ])
            ->assertRedirect(route('charges.index'));

        $charge = Charge::query()
            ->where('description', 'Charge forcee')
            ->firstOrFail();

        $this->assertSame('pending', $charge->status);
        $this->assertDatabaseMissing('payments', [
            'charge_id' => $charge->id,
            'user_id' => $owner->id,
            'status' => 'validated',
        ]);
    }

    public function test_validated_payment_created_by_syndic_marks_charge_as_paid(): void
    {
        [$admin, $owner, $charge] = $this->chargeContext();

        $this->actingAs($admin)
            ->post(route('payments.store'), [
                'charge_id' => $charge->id,
                'amount' => 300,
                'status' => 'validated',
                'payment_date' => now()->toDateString(),
                'method' => 'manuel',
            ])
            ->assertRedirect(route('payments.index'));

        $this->assertDatabaseHas('charges', [
            'id' => $charge->id,
            'status' => 'paid',
        ]);
        $this->assertDatabaseHas('payments', [
            'charge_id' => $charge->id,
            'user_id' => $owner->id,
            'status' => 'validated',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'Mise à jour du statut de charge',
            'performed_by' => $admin->id,
        ]);
    }

    public function test_syndic_can_reopen_paid_charge_and_payment_updates_too(): void
    {
        [$admin, $owner, $charge] = $this->chargeContext([
            'date' => now()->subDay()->toDateString(),
            'status' => 'paid',
        ]);
        $payment = Payment::factory()->create([
            'organization_id' => $admin->organization_id,
            'charge_id' => $charge->id,
            'user_id' => $owner->id,
            'amount' => 300,
            'status' => 'validated',
            'method' => 'manuel',
            'payment_date' => now()->toDateString(),
        ]);

        $this->actingAs($admin)
            ->patch(route('charges.status.update', $charge), ['paid' => false])
            ->assertRedirect();

        $this->assertDatabaseHas('charges', [
            'id' => $charge->id,
            'status' => 'overdue',
        ]);
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'Charge remise en attente',
            'performed_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'Paiement remis en attente',
            'performed_by' => $admin->id,
        ]);
    }

    private function chargeContext(array $chargeOverrides = []): array
    {
        $organization = Organization::create([
            'name' => 'Syndicare Test',
            'slug' => 'charge-payment-status-test-'.str()->random(6),
            'plan' => 'standard',
            'subscription_status' => 'active',
        ]);
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
        $charge = Charge::factory()->create(array_merge([
            'organization_id' => $organization->id,
            'apartment_id' => $apartment->id,
            'description' => 'Charges de test',
            'amount' => 300,
            'status' => 'pending',
            'date' => now()->addDay()->toDateString(),
        ], $chargeOverrides));

        return [$admin, $owner, $charge, $apartment];
    }
}
