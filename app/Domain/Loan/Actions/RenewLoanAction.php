<?php

namespace App\Domain\Loan\Actions;

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Models\Loan;
use App\Domain\Loan\Models\LoanRenewal;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RenewLoanAction
{
    private const RENEWAL_DAYS = 14;

    public function execute(Loan $loan, User $renewedBy): Loan
    {
        return DB::transaction(function () use ($loan, $renewedBy): Loan {
            $lockedLoan = Loan::query()
                ->whereKey($loan->id)
                ->lockForUpdate()
                ->firstOrFail();

            $member = Member::query()
                ->whereKey($lockedLoan->member_id)
                ->lockForUpdate()
                ->firstOrFail();

            $book = Book::withTrashed()
                ->whereKey($lockedLoan->book_id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensureRenewable($lockedLoan, $member, $book);

            $previousDueAt = $lockedLoan->due_at->copy();
            $newDueAt = $previousDueAt->copy()->addDays(self::RENEWAL_DAYS)->endOfDay();

            $lockedLoan->renewals()->create([
                'renewed_by_user_id' => $renewedBy->id,
                'previous_due_at' => $previousDueAt,
                'new_due_at' => $newDueAt,
            ]);

            $lockedLoan->forceFill([
                'due_at' => $newDueAt,
            ])->save();

            return $lockedLoan->refresh();
        });
    }

    private function ensureRenewable(Loan $loan, Member $member, Book $book): void
    {
        if ($loan->returned_at !== null) {
            throw ValidationException::withMessages([
                'loan' => 'Returned loans cannot be renewed.',
            ]);
        }

        if ($loan->return_requested_at !== null) {
            throw ValidationException::withMessages([
                'loan' => 'A loan with a pending return request cannot be renewed.',
            ]);
        }

        if ($loan->due_at->isPast()) {
            throw ValidationException::withMessages([
                'loan' => 'Overdue loans cannot be renewed.',
            ]);
        }

        if (! $member->status->canBorrow()) {
            throw ValidationException::withMessages([
                'member' => 'This member is not eligible to renew loans.',
            ]);
        }

        $hasOtherOverdueLoan = Loan::query()
            ->where('member_id', $member->id)
            ->whereKeyNot($loan->id)
            ->whereNull('returned_at')
            ->where('due_at', '<', now())
            ->exists();

        if ($hasOtherOverdueLoan) {
            throw ValidationException::withMessages([
                'member' => 'This member has another overdue loan.',
            ]);
        }

        if ($book->trashed()) {
            throw ValidationException::withMessages([
                'book' => 'Archived books cannot be renewed.',
            ]);
        }

        $alreadyRenewed = LoanRenewal::query()
            ->where('loan_id', $loan->id)
            ->exists();

        if ($alreadyRenewed) {
            throw ValidationException::withMessages([
                'loan' => 'This loan has already been renewed.',
            ]);
        }
    }
}
