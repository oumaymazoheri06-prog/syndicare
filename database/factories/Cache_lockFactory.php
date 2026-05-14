<?php

namespace Database\Factories;

use App\Models\Cache_lock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cache_lock>
 */
class Cache_lockFactory extends Factory
{
    protected $model = Cache_lock::class;

    public function definition(): array
    {
        return [
            'key' => 'lock:' . fake()->unique()->uuid(),
            'owner' => fake()->uuid(),
            'expiration' => now()->addMinutes(fake()->numberBetween(5, 120))->timestamp,
        ];
    }
}
