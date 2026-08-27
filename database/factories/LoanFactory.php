<?php

namespace Database\Factories;

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Models\Loan;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Loan>
 */
class LoanFactory extends Factory
{
    protected $model = Loan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'member_id' => Member::factory(),
            'book_id' => Book::factory(),
            'issued_by_user_id' => User::factory(),
            'returned_by_user_id' => null,
            'issued_at' => now(),
            'due_at' => now()->addWeeks(2),
            'returned_at' => null,
        ];
    }
}
