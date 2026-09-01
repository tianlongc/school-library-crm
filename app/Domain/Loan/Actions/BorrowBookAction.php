<?php

namespace App\Domain\Loan\Actions;

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Models\Loan;
use App\Domain\User\Models\User;
use Illuminate\Validation\ValidationException;

class BorrowBookAction
{
    private const LOAN_PERIOD_DAYS = 14;

    public function __construct(private IssueLoanAction $issueLoanAction) {}

    public function execute(Book $book, User $borrower): Loan
    {
        $member = $borrower->member;

        if ($member === null) {
            throw ValidationException::withMessages([
                'member' => 'A member profile is required to borrow books.',
            ]);
        }

        return $this->issueLoanAction->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => now()
                    ->addDays(self::LOAN_PERIOD_DAYS)
                    ->endOfDay(),
            ],
            issuedBy: $borrower,
        );
    }
}
