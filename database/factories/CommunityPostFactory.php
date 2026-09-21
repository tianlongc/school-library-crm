<?php

namespace Database\Factories;

use App\Domain\Book\Models\Book;
use App\Domain\Community\Enums\CommunityPostStatus;
use App\Domain\Community\Models\CommunityPost;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityPost>
 */
class CommunityPostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'book_id' => null,
            'body' => fake()->paragraph(),
            'status' => CommunityPostStatus::Published,
        ];
    }

    public function withBook(): static
    {
        return $this->state(fn () => [
            'book_id' => Book::factory(),
        ]);
    }

    public function hidden(): static
    {
        return $this->state(fn () => [
            'status' => CommunityPostStatus::Hidden,
        ]);
    }
}
