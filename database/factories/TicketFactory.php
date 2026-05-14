<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'assingned_by' => User::factory(),
            'assigned_to' => fake()->boolean(70) ? User::factory() : null,
            'status' => fake()->randomElement(['open', 'in_progress', 'closed']),
        ];
    }
}
