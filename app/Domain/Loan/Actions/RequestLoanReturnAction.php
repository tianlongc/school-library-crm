<?php

namespace App\Domain\Loan\Actions;

use App\Domain\Loan\Models\Loan;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RequestLoanReturnAction
{
    public function execute(Loan $loan): Loan
    {
        return DB::transaction(function () use ($loan): Loan {
            $lockedLoan = Loan::query()
                ->lockForUpdate()
                ->findOrFail($loan->id);

            if ($lockedLoan->returned_at !== null) {
                throw ValidationException::withMessages([
                    'loan' => 'This loan has already been returned.',
                ]);
            }

            if ($lockedLoan->return_requested_at !== null) {
                throw ValidationException::withMessages([
                    'loan' => 'This return is already awaiting staff confirmation.',
                ]);
            }

            $lockedLoan->updateOrFail([
                'return_requested_at' => now(),
            ]);

            return $lockedLoan->refresh();
        });
    }
}
