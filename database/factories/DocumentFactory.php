<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    protected $model = Document::class;

    public function definition(): array
    {
        return [
            'title' => fake()->words(3, true),
            'file_path' => 'documents/' . fake()->uuid() . '.pdf',
            'uploaded_by' => User::factory(),
        ];
    }
}
