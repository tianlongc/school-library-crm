<?php

namespace App\Domain\Loan\Actions;

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Models\Loan;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class IssueLoanAction
{
    /**
     * @param array{
     *      member_number: string,
     *      isbn: string,
     *      due_at: CarbonInterface
     * } $attributes
     */
    public function execute(array $attributes, User $issuedBy): Loan
    {
        $memberNumber = $attributes['member_number'];
        $isbn = $attributes['isbn'];
        $dueAt = $attributes['due_at'];

        if (! $dueAt->isFuture()) {
            throw ValidationException::withMessages([
                'due_at' => 'The due date must be in the future',
            ]);
        }

        return DB::transaction(function () use ($memberNumber, $isbn, $dueAt, $issuedBy): Loan {
            $member = Member::query()
                ->where('member_number', $memberNumber)
                ->lockForUpdate()
                ->first();

            if ($member === null) {
                throw ValidationException::withMessages([
                    'member_number' => 'Member not found.',
                ]);
            }

            $book = Book::query()
                ->where('isbn', $isbn)
                ->lockForUpdate()
                ->first();

            if ($book === null) {
                throw ValidationException::withMessages([
                    'isbn' => 'Book not found.',
                ]);
            }

            if (! $member->status->canBorrow()) {
                throw ValidationException::withMessages([
                    'member_number' => 'This member is not eligible to borrow books.',
                ]);
            }

            if ($member->hasOverdueLoans()) {
                throw ValidationException::withMessages([
                    'member_number' => 'This member must return overdue books before borrowing another book.',
                ]);
            }

            $activeLoans = Loan::query()
                ->where('book_id', $book->id)
                ->whereNull('returned_at')
                ->count();

            if ($activeLoans >= $book->total_copies) {
                throw ValidationException::withMessages([
                    'isbn' => 'No copies of this book are currently available.',
                ]);
            }

            $duplicateLoanExists = Loan::query()
                ->where('member_id', $member->id)
                ->where('book_id', $book->id)
                ->whereNull('returned_at')
                ->exists();

            if ($duplicateLoanExists) {
                throw ValidationException::withMessages([
                    'isbn' => 'This member already has an active loan for this book.',
                ]);
            }

            return Loan::query()->create([
                'member_id' => $member->id,
                'book_id' => $book->id,
                'issued_by_user_id' => $issuedBy->id,
                'issued_at' => now(),
                'due_at' => $dueAt,
            ]);
        });
    }
}
