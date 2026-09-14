<?php

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Actions\IssueLoanAction;
use App\Domain\Loan\Actions\RenewLoanAction;
use App\Domain\Loan\Actions\RequestLoanReturnAction;
use App\Domain\Loan\Actions\ReturnLoanAction;
use App\Domain\Loan\Models\Loan;
use App\Domain\Loan\Models\LoanRenewal;
use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

describe('issue loan', function () {
    it('allows an active member to borrow an available book', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $book = Book::factory()->create([
            'total_copies' => 2,
        ]);

        $loan = app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => now()->addWeeks(2),
            ],
            issuedBy: $staff,
        );

        expect($loan)
            ->member_id->toBe($member->id)
            ->book_id->toBe($book->id)
            ->issued_by_user_id->toBe($staff->id)
            ->returned_by_user_id->toBeNull()
            ->returned_at->toBeNull();

        $this->assertDatabaseHas('loans', [
            'member_id' => $member->id,
            'book_id' => $book->id,
            'issued_by_user_id' => $staff->id,
            'returned_by_user_id' => null,
        ]);
    });

    it('rejects a suspended member', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Suspended,
        ]);

        $book = Book::factory()->create([
            'total_copies' => 1,
        ]);

        expect(fn () => app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => now()->addWeek(),
            ],
            issuedBy: $staff,
        ))->toThrow(ValidationException::class);

        $this->assertDatabaseCount('loans', 0);
    });

    it('rejects an inactive member', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Inactive,
        ]);

        $book = Book::factory()->create([
            'total_copies' => 1,
        ]);

        expect(fn () => app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => now()->addWeek(),
            ],
            issuedBy: $staff,
        ))->toThrow(ValidationException::class);

        $this->assertDatabaseCount('loans', 0);
    });

    it('rejects issuing a book when no copies remain', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $otherMember = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $book = Book::factory()->create([
            'total_copies' => 1,
        ]);

        Loan::factory()->create([
            'member_id' => $otherMember->id,
            'book_id' => $book->id,
            'issued_at' => now()->subDay(),
            'due_at' => now()->addWeek(),
            'returned_at' => null,
        ]);

        expect(fn () => app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => now()->addWeeks(2),
            ],
            issuedBy: $staff,
        ))->toThrow(ValidationException::class);

        expect(
            Loan::query()
                ->where('book_id', $book->id)
                ->whereNull('returned_at')
                ->count()
        )->toBe(1);
    });

    it('allows issuing when another copy of the book remains available', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $otherMember = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $book = Book::factory()->create([
            'total_copies' => 2,
        ]);

        Loan::factory()->create([
            'member_id' => $otherMember->id,
            'book_id' => $book->id,
            'returned_at' => null,
        ]);

        $loan = app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => now()->addWeek(),
            ],
            issuedBy: $staff,
        );

        expect($loan->member_id)->toBe($member->id);

        expect(
            Loan::query()
                ->where('book_id', $book->id)
                ->whereNull('returned_at')
                ->count()
        )->toBe(2);
    });

    it('rejects a duplicate active loan for the same member and book', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $book = Book::factory()->create([
            'total_copies' => 3,
        ]);

        Loan::factory()->create([
            'member_id' => $member->id,
            'book_id' => $book->id,
            'returned_at' => null,
        ]);

        expect(fn () => app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => now()->addWeek(),
            ],
            issuedBy: $staff,
        ))->toThrow(ValidationException::class);

        expect(
            Loan::query()
                ->where('member_id', $member->id)
                ->where('book_id', $book->id)
                ->whereNull('returned_at')
                ->count()
        )->toBe(1);
    });

    it('allows borrowing the same book again after the previous loan was returned', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $book = Book::factory()->create([
            'total_copies' => 1,
        ]);

        Loan::factory()->create([
            'member_id' => $member->id,
            'book_id' => $book->id,
            'returned_at' => now()->subDay(),
            'returned_by_user_id' => $staff->id,
        ]);

        $loan = app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => now()->addWeek(),
            ],
            issuedBy: $staff,
        );

        expect($loan)
            ->member_id->toBe($member->id)
            ->book_id->toBe($book->id)
            ->returned_at->toBeNull();

        expect(
            Loan::query()
                ->where('member_id', $member->id)
                ->where('book_id', $book->id)
                ->count()
        )->toBe(2);
    });

    it('rejects a due date that is in the past', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $book = Book::factory()->create([
            'total_copies' => 1,
        ]);

        expect(fn () => app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => now()->subDay(),
            ],
            issuedBy: $staff,
        ))->toThrow(ValidationException::class);

        $this->assertDatabaseCount('loans', 0);
    });

    it('rejects a due date equal to the current time', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $book = Book::factory()->create([
            'total_copies' => 1,
        ]);

        $dueAt = now();

        expect(fn () => app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => $dueAt,
            ],
            issuedBy: $staff,
        ))->toThrow(ValidationException::class);

        $this->assertDatabaseCount('loans', 0);
    });

    it('rejects a member number that does not exist', function () {
        $staff = User::factory()->create();

        $book = Book::factory()->create([
            'total_copies' => 1,
        ]);

        expect(fn () => app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => 'MEMBER-DOES-NOT-EXIST',
                'isbn' => $book->isbn,
                'due_at' => now()->addWeek(),
            ],
            issuedBy: $staff,
        ))->toThrow(ValidationException::class);

        $this->assertDatabaseCount('loans', 0);
    });

    it('rejects an isbn that does not exist', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        expect(fn () => app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => '9999999999999',
                'due_at' => now()->addWeek(),
            ],
            issuedBy: $staff,
        ))->toThrow(ValidationException::class);

        $this->assertDatabaseCount('loans', 0);
    });

    it('rejects issuing an archived book', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $book = Book::factory()->create([
            'total_copies' => 1,
        ]);

        $book->delete();

        expect(fn () => app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => now()->addWeek(),
            ],
            issuedBy: $staff,
        ))->toThrow(ValidationException::class);

        $this->assertDatabaseCount('loans', 0);
    });

    it('does not leave a partial loan record when issuing fails', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Suspended,
        ]);

        $book = Book::factory()->create([
            'total_copies' => 1,
        ]);

        expect(fn () => app(IssueLoanAction::class)->execute(
            attributes: [
                'member_number' => $member->member_number,
                'isbn' => $book->isbn,
                'due_at' => now()->addWeek(),
            ],
            issuedBy: $staff,
        ))->toThrow(ValidationException::class);

        $this->assertDatabaseCount('loans', 0);
    });
});

describe('request loan return', function () {
    it('records a return request without completing the loan', function () {
        $loan = Loan::factory()->create([
            'return_requested_at' => null,
            'returned_at' => null,
            'returned_by_user_id' => null,
        ]);

        $requestedLoan = app(RequestLoanReturnAction::class)->execute($loan);

        expect($requestedLoan->return_requested_at)
            ->not->toBeNull()
            ->and($requestedLoan->returned_at)
            ->toBeNull()
            ->and($requestedLoan->returned_by_user_id)
            ->toBeNull();
    });

    it('rejects requesting an already requested return', function () {
        $requestedAt = now()->subMinute()->startOfSecond();
        $loan = Loan::factory()->create([
            'return_requested_at' => $requestedAt,
            'returned_at' => null,
        ]);

        expect(fn () => app(RequestLoanReturnAction::class)->execute($loan))
            ->toThrow(ValidationException::class);

        expect($loan->fresh()->return_requested_at->equalTo($requestedAt))
            ->toBeTrue();
    });

    it('rejects requesting a return for a completed loan', function () {
        $loan = Loan::factory()->create([
            'return_requested_at' => null,
            'returned_at' => now()->subDay(),
        ]);

        expect(fn () => app(RequestLoanReturnAction::class)->execute($loan))
            ->toThrow(ValidationException::class);

        expect($loan->fresh()->return_requested_at)->toBeNull();
    });
});

describe('return loan', function () {
    it('returns an active loan', function () {
        $staff = User::factory()->create();

        $loan = Loan::factory()->create([
            'returned_at' => null,
            'returned_by_user_id' => null,
        ]);

        $returnedLoan = app(ReturnLoanAction::class)->execute(
            loan: $loan,
            returnedBy: $staff,
        );

        expect($returnedLoan->returned_at)
            ->not->toBeNull()
            ->and($returnedLoan->returned_by_user_id)
            ->toBe($staff->id);

        $this->assertDatabaseHas('loans', [
            'id' => $loan->id,
            'returned_by_user_id' => $staff->id,
        ]);

        expect(
            Loan::query()
                ->findOrFail($loan->id)
                ->returned_at
        )->not->toBeNull();
    });

    it('rejects returning an already returned loan', function () {
        $returningStaff = User::factory()->create();
        $originalReturningStaff = User::factory()->create();

        $returnedAt = now()->subDay()->startOfSecond();

        $loan = Loan::factory()->create([
            'returned_at' => $returnedAt,
            'returned_by_user_id' => $originalReturningStaff->id,
        ]);

        expect(fn () => app(ReturnLoanAction::class)->execute(
            loan: $loan,
            returnedBy: $returningStaff,
        ))->toThrow(ValidationException::class);

        $loan->refresh();

        expect($loan->returned_by_user_id)
            ->toBe($originalReturningStaff->id);

        expect($loan->returned_at->equalTo($returnedAt))
            ->toBeTrue();
    });

    it('allows a suspended member to return an existing loan', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Suspended,
        ]);

        $loan = Loan::factory()->create([
            'member_id' => $member->id,
            'returned_at' => null,
            'returned_by_user_id' => null,
        ]);

        $returnedLoan = app(ReturnLoanAction::class)->execute(
            loan: $loan,
            returnedBy: $staff,
        );

        expect($returnedLoan->returned_at)
            ->not->toBeNull()
            ->and($returnedLoan->returned_by_user_id)
            ->toBe($staff->id);
    });

    it('allows an inactive member to return an existing loan', function () {
        $staff = User::factory()->create();

        $member = Member::factory()->create([
            'status' => MemberStatus::Inactive,
        ]);

        $loan = Loan::factory()->create([
            'member_id' => $member->id,
            'returned_at' => null,
            'returned_by_user_id' => null,
        ]);

        $returnedLoan = app(ReturnLoanAction::class)->execute(
            loan: $loan,
            returnedBy: $staff,
        );

        expect($returnedLoan->returned_at)
            ->not->toBeNull()
            ->and($returnedLoan->returned_by_user_id)
            ->toBe($staff->id);
    });
});
describe('renew loan', function () {
    it('extends the current due date by fourteen days and records an audit entry', function () {
        $renewedBy = User::factory()->create();
        $member = Member::factory()->create();
        $book = Book::factory()->create();
        $issuedAt = now()->subWeek()->startOfSecond();
        $previousDueAt = now()->addWeek()->endOfDay()->startOfSecond();

        $loan = Loan::factory()
            ->for($member)
            ->for($book)
            ->create([
                'issued_at' => $issuedAt,
                'due_at' => $previousDueAt,
                'return_requested_at' => null,
                'returned_at' => null,
                'returned_by_user_id' => null,
            ]);

        $renewedLoan = app(RenewLoanAction::class)->execute(
            loan: $loan,
            renewedBy: $renewedBy,
        );

        $expectedDueAt = $previousDueAt->copy()->addDays(14)->endOfDay()->startOfSecond();
        $renewal = LoanRenewal::query()->sole();

        expect($renewedLoan->due_at->equalTo($expectedDueAt))
            ->toBeTrue()
            ->and($renewedLoan->issued_at->equalTo($issuedAt))
            ->toBeTrue()
            ->and($renewedLoan->return_requested_at)
            ->toBeNull()
            ->and($renewedLoan->returned_at)
            ->toBeNull()
            ->and($renewedLoan->returned_by_user_id)
            ->toBeNull()
            ->and($renewal->loan_id)
            ->toBe($loan->id)
            ->and($renewal->renewed_by_user_id)
            ->toBe($renewedBy->id)
            ->and($renewal->previous_due_at->equalTo($previousDueAt))
            ->toBeTrue()
            ->and($renewal->new_due_at->equalTo($expectedDueAt))
            ->toBeTrue();
    });

    it('rejects an overdue loan without changing its due date', function () {
        $renewedBy = User::factory()->create();
        $previousDueAt = now()->subDay()->endOfDay()->startOfSecond();
        $loan = Loan::factory()->create([
            'due_at' => $previousDueAt,
            'return_requested_at' => null,
            'returned_at' => null,
        ]);

        expect(fn () => app(RenewLoanAction::class)->execute($loan, $renewedBy))
            ->toThrow(ValidationException::class, 'Overdue loans cannot be renewed.');

        expect($loan->fresh()->due_at->equalTo($previousDueAt))
            ->toBeTrue()
            ->and(LoanRenewal::query()->count())
            ->toBe(0);
    });

    it('rejects a loan with a pending return request', function () {
        $renewedBy = User::factory()->create();
        $previousDueAt = now()->addWeek()->endOfDay()->startOfSecond();
        $loan = Loan::factory()->create([
            'due_at' => $previousDueAt,
            'return_requested_at' => now(),
            'returned_at' => null,
        ]);

        expect(fn () => app(RenewLoanAction::class)->execute($loan, $renewedBy))
            ->toThrow(
                ValidationException::class,
                'A loan with a pending return request cannot be renewed.',
            );

        expect($loan->fresh()->due_at->equalTo($previousDueAt))
            ->toBeTrue()
            ->and(LoanRenewal::query()->count())
            ->toBe(0);
    });

    it('rejects a returned loan', function () {
        $renewedBy = User::factory()->create();
        $previousDueAt = now()->addWeek()->endOfDay()->startOfSecond();
        $loan = Loan::factory()->create([
            'due_at' => $previousDueAt,
            'return_requested_at' => null,
            'returned_at' => now(),
        ]);

        expect(fn () => app(RenewLoanAction::class)->execute($loan, $renewedBy))
            ->toThrow(ValidationException::class, 'Returned loans cannot be renewed.');

        expect($loan->fresh()->due_at->equalTo($previousDueAt))
            ->toBeTrue()
            ->and(LoanRenewal::query()->count())
            ->toBe(0);
    });

    it('rejects renewal when the member is not active', function (MemberStatus $status) {
        $renewedBy = User::factory()->create();
        $member = Member::factory()->create(['status' => $status]);
        $previousDueAt = now()->addWeek()->endOfDay()->startOfSecond();
        $loan = Loan::factory()->for($member)->create([
            'due_at' => $previousDueAt,
            'return_requested_at' => null,
            'returned_at' => null,
        ]);

        expect(fn () => app(RenewLoanAction::class)->execute($loan, $renewedBy))
            ->toThrow(
                ValidationException::class,
                'This member is not eligible to renew loans.',
            );

        expect($loan->fresh()->due_at->equalTo($previousDueAt))
            ->toBeTrue()
            ->and(LoanRenewal::query()->count())
            ->toBe(0);
    })->with([
        'suspended member' => MemberStatus::Suspended,
        'inactive member' => MemberStatus::Inactive,
    ]);

    it('rejects renewal when the member has another overdue loan', function () {
        $renewedBy = User::factory()->create();
        $member = Member::factory()->create();
        $previousDueAt = now()->addWeek()->endOfDay()->startOfSecond();
        $loan = Loan::factory()->for($member)->create([
            'due_at' => $previousDueAt,
            'return_requested_at' => null,
            'returned_at' => null,
        ]);

        Loan::factory()->for($member)->create([
            'due_at' => now()->subDay(),
            'return_requested_at' => null,
            'returned_at' => null,
        ]);

        expect(fn () => app(RenewLoanAction::class)->execute($loan, $renewedBy))
            ->toThrow(ValidationException::class, 'This member has another overdue loan.');

        expect($loan->fresh()->due_at->equalTo($previousDueAt))
            ->toBeTrue()
            ->and(LoanRenewal::query()->count())
            ->toBe(0);
    });

    it('rejects renewal for an archived book', function () {
        $renewedBy = User::factory()->create();
        $book = Book::factory()->create();
        $previousDueAt = now()->addWeek()->endOfDay()->startOfSecond();
        $loan = Loan::factory()->for($book)->create([
            'due_at' => $previousDueAt,
            'return_requested_at' => null,
            'returned_at' => null,
        ]);
        $book->delete();

        expect(fn () => app(RenewLoanAction::class)->execute($loan, $renewedBy))
            ->toThrow(ValidationException::class, 'Archived books cannot be renewed.');

        expect($loan->fresh()->due_at->equalTo($previousDueAt))
            ->toBeTrue()
            ->and(LoanRenewal::query()->count())
            ->toBe(0);
    });

    it('allows only one renewal per loan', function () {
        $renewedBy = User::factory()->create();
        $previousDueAt = now()->addWeek()->endOfDay()->startOfSecond();
        $firstNewDueAt = $previousDueAt->copy()->addDays(14)->endOfDay()->startOfSecond();
        $loan = Loan::factory()->create([
            'due_at' => $firstNewDueAt,
            'return_requested_at' => null,
            'returned_at' => null,
        ]);

        LoanRenewal::query()->forceCreate([
            'loan_id' => $loan->id,
            'renewed_by_user_id' => $renewedBy->id,
            'previous_due_at' => $previousDueAt,
            'new_due_at' => $firstNewDueAt,
        ]);

        expect(fn () => app(RenewLoanAction::class)->execute($loan, $renewedBy))
            ->toThrow(ValidationException::class, 'This loan has already been renewed.');

        expect($loan->fresh()->due_at->equalTo($firstNewDueAt))
            ->toBeTrue()
            ->and($loan->renewals()->count())
            ->toBe(1);
    });
});
