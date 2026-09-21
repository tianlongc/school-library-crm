<?php

namespace Database\Factories;

use App\Domain\Community\Models\CommunityPost;
use App\Domain\Community\Models\CommunityPostComment;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityPostComment>
 */
class CommunityPostCommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'community_post_id' => CommunityPost::factory(),
            'user_id' => User::factory(),
            'body' => fake()->sentence(),
        ];
    }
}
