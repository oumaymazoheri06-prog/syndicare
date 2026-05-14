<?php

namespace Database\Factories;

use App\Models\Building;
use App\Models\Expense;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'title' => fake()->words(3, true),
            'description' => fake()->sentence(8),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'date' => fake()->dateTimeBetween('-6 months', '+1 month')->format('Y-m-d'),
            'building_id' => Building::factory(),
        ];
    }
}
