<?php

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Enums\LoanStatus;
use App\Domain\Loan\Models\Loan;
use App\Domain\Loan\Queries\LoanQuery;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;

beforeEach(function () {
    $this->loanQuery = app(LoanQuery::class);
});

describe('loan query', function () {
    it('returns twelve loans per page', function () {
        Loan::factory()->count(13)->create();

        $loans = $this->loanQuery->paginate();

        expect($loans->perPage())
            ->toBe(12)
            ->and($loans->count())
            ->toBe(12)
            ->and($loans->total())
            ->toBe(13);
    });

    it('returns the newest issued loans first', function () {
        $olderLoan = Loan::factory()->create([
            'issued_at' => now()->subDay(),
        ]);
        $newerLoan = Loan::factory()->create([
            'issued_at' => now(),
        ]);

        $loans = $this->loanQuery->paginate();

        expect($loans->items()[0]->is($newerLoan))
            ->toBeTrue()
            ->and($loans->items()[1]->is($olderLoan))
            ->toBeTrue();
    });

    it('searches by member number', function () {
        $member = Member::factory()->create([
            'member_number' => 'MEM-SEARCH-001',
        ]);
        $matchingLoan = Loan::factory()->for($member, 'member')->create();
        Loan::factory()->create();

        $loans = $this->loanQuery->paginate(search: 'SEARCH-001');

        expect($loans->total())
            ->toBe(1)
            ->and($loans->first()->is($matchingLoan))
            ->toBeTrue();
    });

    it('searches by member name', function () {
        $user = User::factory()->create(['name' => 'Distinctive Borrower']);
        $member = Member::factory()->for($user)->create();
        $matchingLoan = Loan::factory()->for($member, 'member')->create();
        Loan::factory()->create();

        $loans = $this->loanQuery->paginate(search: 'Borrower');

        expect($loans->total())
            ->toBe(1)
            ->and($loans->first()->is($matchingLoan))
            ->toBeTrue();
    });

    it('searches by book title', function () {
        $book = Book::factory()->create(['title' => 'The Searchable Voyage']);
        $matchingLoan = Loan::factory()->for($book, 'book')->create();
        Loan::factory()->create();

        $loans = $this->loanQuery->paginate(search: 'Searchable');

        expect($loans->total())
            ->toBe(1)
            ->and($loans->first()->is($matchingLoan))
            ->toBeTrue();
    });

    it('searches by partial isbn', function () {
        $book = Book::factory()->create(['isbn' => '9781234567890']);
        $matchingLoan = Loan::factory()->for($book, 'book')->create();
        Loan::factory()->create();

        $loans = $this->loanQuery->paginate(search: '345678');

        expect($loans->total())
            ->toBe(1)
            ->and($loans->first()->is($matchingLoan))
            ->toBeTrue();
    });

    it('filters active loans', function () {
        $activeLoan = Loan::factory()->create([
            'due_at' => now()->addWeek(),
            'returned_at' => null,
        ]);
        Loan::factory()->create([
            'due_at' => now()->subDay(),
            'returned_at' => null,
        ]);

        $loans = $this->loanQuery->paginate(status: LoanStatus::Active->value);

        expect($loans->total())
            ->toBe(1)
            ->and($loans->first()->is($activeLoan))
            ->toBeTrue();
    });

    it('filters overdue loans', function () {
        $overdueLoan = Loan::factory()->create([
            'due_at' => now()->subDay(),
            'returned_at' => null,
        ]);
        Loan::factory()->create([
            'due_at' => now()->addWeek(),
            'returned_at' => null,
        ]);

        $loans = $this->loanQuery->paginate(status: LoanStatus::Overdue->value);

        expect($loans->total())
            ->toBe(1)
            ->and($loans->first()->is($overdueLoan))
            ->toBeTrue();
    });

    it('filters returned loans', function () {
        $returnedLoan = Loan::factory()->create([
            'returned_at' => now()->subDay(),
        ]);
        Loan::factory()->create(['returned_at' => null]);

        $loans = $this->loanQuery->paginate(status: LoanStatus::Returned->value);

        expect($loans->total())
            ->toBe(1)
            ->and($loans->first()->is($returnedLoan))
            ->toBeTrue();
    });

    it('eager loads relationships required by the loan resource', function () {
        Loan::factory()->create();

        $loan = $this->loanQuery->paginate()->first();

        expect($loan->relationLoaded('member'))
            ->toBeTrue()
            ->and($loan->member->relationLoaded('user'))
            ->toBeTrue()
            ->and($loan->relationLoaded('book'))
            ->toBeTrue()
            ->and($loan->relationLoaded('issuedBy'))
            ->toBeTrue()
            ->and($loan->relationLoaded('returnedBy'))
            ->toBeTrue();
    });
});
