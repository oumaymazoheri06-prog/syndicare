<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'message' => fake()->sentence(12),
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['info', 'warning', 'error']),
            'is_read' => fake()->boolean(40),
        ];
    }
}
