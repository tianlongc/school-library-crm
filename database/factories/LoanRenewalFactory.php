<?php

namespace Database\Factories;

use App\Domain\Loan\Models\Loan;
use App\Domain\Loan\Models\LoanRenewal;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoanRenewal>
 */
class LoanRenewalFactory extends Factory
{
    protected $model = LoanRenewal::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $previousDueAt = now()->addDays(7);

        return [
            'loan_id' => Loan::factory(),
            'renewed_by_user_id' => User::factory(),
            'previous_due_at' => $previousDueAt,
            'new_due_at' => $previousDueAt->copy()->addDays(14),
        ];
    }
}
