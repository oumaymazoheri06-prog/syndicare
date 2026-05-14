<?php

namespace Database\Factories;

use App\Models\Building;
use App\Models\Floor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Floor>
 */
class FloorFactory extends Factory
{
    protected $model = Floor::class;

    public function definition(): array
    {
        return [
            'number' => (string) fake()->unique()->numberBetween(1, 20),
            'building_id' => Building::factory(),
        ];
    }
}
