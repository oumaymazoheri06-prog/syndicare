<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\Ticket_message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ticket_message>
 */
class Ticket_messageFactory extends Factory
{
    protected $model = Ticket_message::class;

    public function definition(): array
    {
        return [
            'ticket_id' => Ticket::factory(),
            'sender_id' => User::factory(),
            'message' => fake()->paragraph(),
        ];
    }
}
