<?php

use App\Domain\Loan\Models\Loan;
use App\Domain\Loan\Queries\LoanReportQuery;
use App\Domain\Member\Models\Member;

beforeEach(function (): void {
    $this->travelTo(now()->setTime(12, 0));
});

afterEach(function (): void {
    $this->travelBack();
});

it('returns only overdue loans', function (): void {
    $overdueLoan = Loan::factory()->create([
        'due_at' => now()->subDays(3),
        'return_requested_at' => null,
        'returned_at' => null,
    ]);

    Loan::factory()->create([
        'due_at' => now()->addDays(3),
        'return_requested_at' => null,
        'returned_at' => null,
    ]);

    Loan::factory()->create([
        'due_at' => now()->subDays(3),
        'return_requested_at' => now()->subDay(),
        'returned_at' => null,
    ]);

    Loan::factory()->create([
        'due_at' => now()->subDays(3),
        'return_requested_at' => null,
        'returned_at' => now()->subDay(),
    ]);

    $results = app(LoanReportQuery::class)
        ->overdue()
        ->get();

    expect($results)
        ->toHaveCount(1)
        ->and($results->first()->is($overdueLoan))
        ->toBeTrue();
});

it('filters overdue loans by search text', function (): void {
    $matchingLoan = Loan::factory()
        ->for(
            Member::factory()->create([
                'member_number' => 'MEM-OVERDUE-001',
            ]),
            'member',
        )
        ->create([
            'due_at' => now()->subDays(2),
        ]);

    Loan::factory()->create([
        'due_at' => now()->subDays(2),
    ]);

    $results = app(LoanReportQuery::class)
        ->overdue(search: 'OVERDUE-001')
        ->get();

    expect($results)
        ->toHaveCount(1)
        ->and($results->first()->is($matchingLoan))
        ->toBeTrue();
});

it('filters overdue loans by due date range', function (): void {
    $matchingLoan = Loan::factory()->create([
        'due_at' => now()->subDays(3),
    ]);

    Loan::factory()->create([
        'due_at' => now()->subDays(10),
    ]);

    $results = app(LoanReportQuery::class)->overdue(
        from: now()->subDays(5)->startOfDay(),
        to: now()->subDays(1)->endOfDay(),
    )->get();

    expect($results)
        ->toHaveCount(1)
        ->and($results->first()->is($matchingLoan))
        ->toBeTrue();
});
