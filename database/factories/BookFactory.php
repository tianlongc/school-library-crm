<?php

namespace Database\Factories;

use App\Domain\Book\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'author' => fake()->name(),
            'isbn' => fake()->unique()->numerify('#############'),
            'description' => fake()->optional()->paragraph(),
            'total_copies' => fake()->numberBetween(1, 20),
        ];
    }
}
