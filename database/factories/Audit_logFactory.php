<?php

namespace Database\Factories;

use App\Models\Audit_log;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Audit_log>
 */
class Audit_logFactory extends Factory
{
    protected $model = Audit_log::class;

    public function definition(): array
    {
        return [
            'action' => fake()->randomElement(['created', 'updated', 'deleted', 'reviewed']),
            'details' => fake()->sentence(10),
            'performed_by' => User::factory(),
        ];
    }
}
