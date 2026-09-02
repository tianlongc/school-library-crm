<?php

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Actions\IssueLoanAction;
use App\Domain\Loan\Actions\RequestLoanReturnAction;
use App\Domain\Loan\Actions\ReturnLoanAction;
use App\Domain\Loan\Models\Loan;
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
