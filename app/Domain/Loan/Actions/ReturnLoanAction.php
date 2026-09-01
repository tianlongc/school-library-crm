<?php

namespace App\Domain\Loan\Actions;

use App\Domain\Loan\Models\Loan;
use App\Domain\User\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReturnLoanAction
{
    public function execute(Loan $loan, User $returnedBy): Loan
    {
        return DB::transaction(function () use ($loan, $returnedBy): Loan {
            $lockedLoan = Loan::query()
                ->lockForUpdate()
                ->findOrFail($loan->id);

            if ($lockedLoan->returned_at !== null) {
                throw ValidationException::withMessages([
                    'loan' => 'This loan has already been returned.',
                ]);
            }

            $lockedLoan->updateOrFail([
                'returned_at' => now(),
                'returned_by_user_id' => $returnedBy->id,
            ]);

            return $lockedLoan->refresh();
        });
    }
}
