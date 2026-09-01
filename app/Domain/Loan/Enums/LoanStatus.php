<?php

namespace App\Domain\Loan\Enums;

use App\Domain\Loan\Models\Loan;

enum LoanStatus: string
{
    case Active = 'active';
    case Overdue = 'overdue';
    case Returned = 'returned';

    public static function fromLoan(Loan $loan): self
    {
        if ($loan->returned_at !== null) {
            return self::Returned;
        }
        if ($loan->due_at->isPast()) {
            return self::Overdue;
        }

        return self::Active;
    }
}
