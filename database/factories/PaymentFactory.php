<?php

namespace Database\Factories;

use App\Models\Charge;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'amount' => fake()->randomFloat(2, 50, 1200),
            'charge_id' => Charge::factory(),
            'status' => fake()->randomElement(['pending', 'validated']),
            'payment_date' => fake()->optional()->date(),
        ];
    }
}
