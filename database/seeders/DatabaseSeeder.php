<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Apartment;
use App\Models\Audit_log;
use App\Models\Building;
use App\Models\Cache_lock;
use App\Models\Charge;
use App\Models\Document;
use App\Models\Expense;
use App\Models\Floor;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Receipt;
use App\Models\Ticket;
use App\Models\Ticket_message;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $syndic = User::factory()->create([
            'name' => 'System Admin',
            'email' => 'syndic@example.com',
            'phone_number' => '0600000001',
            'role' => 'Syndic',
        ]);

        $coOwners = User::factory()
            ->count(6)
            ->create([
                'role' => 'Coproprietaire',
            ]);

        $residents = User::factory()
            ->count(12)
            ->create([
                'role' => 'Locataire',
            ]);

        $assignableUsers = $coOwners->merge($residents);
        $allUsers = $assignableUsers->push($syndic);

        $buildings = Building::factory()->count(3)->create();
        $apartments = collect();
        $charges = collect();
        $payments = collect();

        foreach ($buildings as $buildingIndex => $building) {
            $floors = Floor::factory()
                ->count(3)
                ->create([
                    'building_id' => $building->id,
                ]);

            foreach ($floors as $floorIndex => $floor) {
                foreach (range(1, 4) as $apartmentIndex) {
                    $apartments->push(
                        Apartment::factory()->create([
                            'number' => sprintf(
                                'B%s-F%s-A%s',
                                $buildingIndex + 1,
                                $floorIndex + 1,
                                $apartmentIndex
                            ),
                            'floor_id' => $floor->id,
                            'user_id' => $assignableUsers->random()->id,
                            'area' => fake()->randomFloat(2, 45, 160),
                        ])
                    );
                }
            }
        }

        foreach ($apartments as $apartment) {
            foreach (range(1, 2) as $chargeIndex) {
                $charges->push(
                    Charge::factory()->create([
                        'description' => fake()->sentence(4),
                        'amount' => fake()->randomFloat(2, 50, 1200),
                        'date' => fake()->dateTimeBetween('-6 months', '+1 month')->format('Y-m-d'),
                        'apartment_id' => $apartment->id,
                        'status' => fake()->randomElement(['pending', 'paid', 'overdue']),
                    ])
                );
            }
        }

        foreach ($charges as $charge) {
            $isValidated = fake()->boolean(65);

            $payments->push(
                Payment::factory()->create([
                    'amount' => $charge->amount,
                    'charge_id' => $charge->id,
                    'status' => $isValidated ? 'validated' : 'pending',
                    'payment_date' => $isValidated
                        ? fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d')
                        : null,
                ])
            );
        }

        foreach ($payments->where('status', 'validated') as $payment) {
            if (fake()->boolean(75)) {
                Receipt::factory()->create([
                    'payment_id' => $payment->id,
                ]);
            }
        }

        foreach ($buildings as $building) {
            Expense::factory()
                ->count(4)
                ->create([
                    'building_id' => $building->id,
                ]);
        }

        Announcement::factory()
            ->count(6)
            ->create([
                'creator_id' => $syndic->id,
            ]);

        foreach ($allUsers as $user) {
            Notification::factory()
                ->count(2)
                ->create([
                    'user_id' => $user->id,
                ]);
        }

        foreach ($allUsers->take(10) as $user) {
            Document::factory()->create([
                'uploaded_by' => $user->id,
            ]);
        }

        $ticketOwners = $residents->take(8);

        foreach ($ticketOwners as $resident) {
            $ticket = Ticket::factory()->create([
                'title' => fake()->sentence(4),
                'description' => fake()->paragraph(),
                'assingned_by' => $resident->id,
                'assigned_to' => $syndic->id,
                'status' => fake()->randomElement(['open', 'in_progress', 'closed']),
            ]);

            Ticket_message::factory()->create([
                'ticket_id' => $ticket->id,
                'sender_id' => $resident->id,
                'message' => fake()->sentence(12),
            ]);

            Ticket_message::factory()->create([
                'ticket_id' => $ticket->id,
                'sender_id' => $syndic->id,
                'message' => fake()->sentence(14),
            ]);
        }

        Audit_log::factory()
            ->count(12)
            ->create([
                'performed_by' => $syndic->id,
            ]);

        Cache_lock::factory()
            ->count(3)
            ->create();
    }
}
