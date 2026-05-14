<?php

namespace Database\Factories;

use App\Models\Apartment;
use App\Models\Floor;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Apartment>
 */
class ApartmentFactory extends Factory
{
    protected $model = Apartment::class;

    public function definition(): array
    {
        return [
            'number' => 'A-' . fake()->unique()->numberBetween(1, 999),
            'floor_id' => Floor::factory(),
            'user_id' => User::factory(),
            'area' => fake()->randomFloat(2, 40, 180),
        ];
    }
}
