<?php

namespace Database\Factories;

use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Member>
 */
class MemberFactory extends Factory
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
            'member_number' => 'MEM'.fake()->unique()->numerify('######'),
            'status' => MemberStatus::Active,
        ];
    }

    public function suspended(): static
    {
        return $this->state(fn (): array => [
            'status' => MemberStatus::Suspended,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => [
            'status' => MemberStatus::Inactive,
        ]);
    }
}
