<?php

namespace Database\Factories;

use App\Models\Apartment;
use App\Models\Charge;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Charge>
 */
class ChargeFactory extends Factory
{
    protected $model = Charge::class;

    public function definition(): array
    {
        return [
            'description' => fake()->sentence(4),
            'amount' => fake()->randomFloat(2, 50, 1200),
            'date' => fake()->dateTimeBetween('-6 months', '+1 month')->format('Y-m-d'),
            'apartment_id' => Apartment::factory(),
            'status' => fake()->randomElement(['pending', 'paid', 'overdue']),
        ];
    }
}
