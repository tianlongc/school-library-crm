<?php

namespace App\Domain\Loan\Enums;

use App\Domain\Loan\Models\Loan;

enum LoanStatus: string
{
    case Active = 'active';
    case Overdue = 'overdue';
    case ReturnRequested = 'return_requested';
    case Returned = 'returned';

    public static function fromLoan(Loan $loan): self
    {
        if ($loan->returned_at !== null) {
            return self::Returned;
        }
        if ($loan->return_requested_at !== null) {
            return self::ReturnRequested;
        }
        if ($loan->due_at->isPast()) {
            return self::Overdue;
        }

        return self::Active;
    }
}
