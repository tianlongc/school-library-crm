<?php

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Models\Loan;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function loanStaffWithRole(string $role = 'librarian'): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

/*
|--------------------------------------------------------------------------
| Guest authorization
|--------------------------------------------------------------------------
*/

test('guest is redirected away from loan management', function () {
    $this->get(route('staff.loans.index'))
        ->assertRedirect(route('login'));
});

test('guest cannot query the loan table', function () {
    $this->postJson(route('staff.loans.query'))
        ->assertUnauthorized();
});

test('guest cannot renew a loan', function () {
    $loan = Loan::factory()->create([
        'due_at' => now()->addDays(7)->endOfDay(),
        'returned_at' => null,
        'return_requested_at' => null,
    ]);

    $this->postJson(route('staff.loans.renew', $loan))
        ->assertUnauthorized();
});

/*
|--------------------------------------------------------------------------
| Member authorization
|--------------------------------------------------------------------------
*/

test('member cannot access loan management', function () {
    $member = loanStaffWithRole('member');

    $this->actingAs($member)
        ->get(route('staff.loans.index'))
        ->assertForbidden();
});

test('member cannot query loan management', function () {
    $member = loanStaffWithRole('member');

    $this->actingAs($member)
        ->postJson(route('staff.loans.query'))
        ->assertForbidden();
});

test('member cannot renew a loan', function () {
    $member = loanStaffWithRole('member');

    $loan = Loan::factory()->create([
        'due_at' => now()->addDays(7)->endOfDay(),
        'returned_at' => null,
        'return_requested_at' => null,
    ]);

    $this->actingAs($member)
        ->postJson(route('staff.loans.renew', $loan))
        ->assertForbidden();
});

/*
|--------------------------------------------------------------------------
| Administrator authorization
|--------------------------------------------------------------------------
*/

test('administrator can renew an eligible loan', function () {
    $administrator = loanStaffWithRole('admin');

    $loan = Loan::factory()->create([
        'due_at' => now()->addDays(7)->endOfDay(),
        'returned_at' => null,
        'return_requested_at' => null,
    ]);

    $this->actingAs($administrator)
        ->postJson(route('staff.loans.renew', $loan))
        ->assertSuccessful();

    expect($loan->renewals()->count())
        ->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Authenticated librarian loan management
|--------------------------------------------------------------------------
*/

describe('authenticated loan management', function () {
    beforeEach(function () {
        $this->staff = loanStaffWithRole();
        $this->actingAs($this->staff);
    });

    /*
    |--------------------------------------------------------------------------
    | Loan table
    |--------------------------------------------------------------------------
    */

    it('renders the loan index with filters and pagination metadata', function () {
        Loan::factory()->count(2)->create();

        $this->get(route('staff.loans.index'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Staff/Loans/Index')
                ->has('loans.data', 2)
                ->has('loans.meta')
                ->where('filters.search', '')
                ->where('filters.status', '')
                ->where('filters.page', 1)
                ->where('filters.per_page', 10)
                ->where('filters.sort', 'issued_at')
                ->where('filters.direction', 'desc')
            );
    });

    it('renders member return requests in the staff ledger', function () {
        $requestedLoan = Loan::factory()->create([
            'return_requested_at' => now(),
            'returned_at' => null,
        ]);

        Loan::factory()->create([
            'return_requested_at' => null,
            'returned_at' => null,
        ]);

        $this->postJson(route('staff.loans.query'), [
            'status' => 'return_requested',
        ])
            ->assertSuccessful()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $requestedLoan->id)
            ->assertJsonPath('data.0.status', 'return_requested')
            ->assertJsonPath('filters.status', 'return_requested');
    });

    it('normalizes invalid loan table parameters', function () {
        $this->postJson(route('staff.loans.query'), [
            'page' => 0,
            'per_page' => 999,
            'sort' => 'status',
            'direction' => 'sideways',
        ])
            ->assertSuccessful()
            ->assertJsonPath('filters.page', 1)
            ->assertJsonPath('filters.per_page', 10)
            ->assertJsonPath('filters.sort', 'issued_at')
            ->assertJsonPath('filters.direction', 'desc');
    });

    it('normalizes an invalid status filter', function () {
        $this->postJson(route('staff.loans.query'), [
            'status' => 'invalid',
        ])
            ->assertSuccessful()
            ->assertJsonPath('filters.status', '');
    });

    it('accepts explicit loan page state without query-string pagination', function () {
        Loan::factory()->count(13)->create();

        $this->postJson(route('staff.loans.query'), [
            'page' => 2,
            'per_page' => 5,
        ])
            ->assertSuccessful()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonPath('meta.total', 13)
            ->assertJsonPath('filters.page', 2);
    });

    /*
    |--------------------------------------------------------------------------
    | Issue loan
    |--------------------------------------------------------------------------
    */

    it('renders the issue loan page', function () {
        $this->get(route('staff.loans.create'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Staff/Loans/Create')
            );
    });

    it('issues a loan from valid json', function () {
        $member = Member::factory()->create();

        $book = Book::factory()->create([
            'total_copies' => 1,
        ]);

        $this->postJson(route('staff.loans.store'), [
            'member_number' => $member->member_number,
            'isbn' => $book->isbn,
            'due_at' => now()->addWeeks(2)->toDateString(),
        ])
            ->assertCreated()
            ->assertJsonPath('message', 'Loan created successfully')
            ->assertJsonPath('loan.member.id', $member->id)
            ->assertJsonPath('loan.book.id', $book->id)
            ->assertJsonPath('loan.status', 'active')
            ->assertJsonPath('loan.issued_by', $this->staff->name);

        $loan = Loan::query()->sole();

        expect($loan->member->is($member))
            ->toBeTrue()
            ->and($loan->book->is($book))
            ->toBeTrue()
            ->and($loan->issuedBy->is($this->staff))
            ->toBeTrue()
            ->and($loan->due_at->format('H:i:s'))
            ->toBe('23:59:59');
    });

    it('rejects missing issue loan fields', function () {
        $this->postJson(route('staff.loans.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'member_number',
                'isbn',
                'due_at',
            ]);
    });

    /*
    |--------------------------------------------------------------------------
    | Return loan
    |--------------------------------------------------------------------------
    */

    it('returns an active loan', function () {
        $loan = Loan::factory()->create([
            'returned_at' => null,
            'returned_by_user_id' => null,
        ]);

        $this->postJson(route('staff.loans.return', $loan))
            ->assertSuccessful()
            ->assertJsonPath(
                'message',
                'Book received and loan completed.',
            )
            ->assertJsonPath('loan.id', $loan->id)
            ->assertJsonPath('loan.status', 'returned')
            ->assertJsonPath(
                'loan.returned_by',
                $this->staff->name,
            );

        $returnedLoan = $loan->fresh();

        expect($returnedLoan->returned_by_user_id)
            ->toBe($this->staff->id)
            ->and($returnedLoan->returned_at)
            ->not->toBeNull();
    });

    it('confirms a member requested return', function () {
        $requestedAt = now()
            ->subMinute()
            ->startOfSecond();

        $loan = Loan::factory()->create([
            'return_requested_at' => $requestedAt,
            'returned_at' => null,
            'returned_by_user_id' => null,
        ]);

        $this->postJson(route('staff.loans.return', $loan))
            ->assertSuccessful()
            ->assertJsonPath(
                'message',
                'Book received and loan completed.',
            )
            ->assertJsonPath('loan.status', 'returned')
            ->assertJsonPath(
                'loan.returned_by',
                $this->staff->name,
            );

        $loan->refresh();

        expect(
            $loan->return_requested_at->equalTo($requestedAt)
        )
            ->toBeTrue()
            ->and($loan->returned_at)
            ->not->toBeNull()
            ->and($loan->returned_by_user_id)
            ->toBe($this->staff->id);
    });

    it('rejects returning the same loan twice', function () {
        $loan = Loan::factory()->create();

        $this->postJson(route('staff.loans.return', $loan))
            ->assertSuccessful();

        $this->postJson(route('staff.loans.return', $loan))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('loan');
    });

    /*
    |--------------------------------------------------------------------------
    | Renew loan
    |--------------------------------------------------------------------------
    */

    it('librarian can renew an eligible loan', function () {
        $originalDueAt = now()
            ->addDays(7)
            ->endOfDay()
            ->startOfSecond();

        $loan = Loan::factory()->create([
            'due_at' => $originalDueAt,
            'returned_at' => null,
            'return_requested_at' => null,
        ]);

        $this->postJson(route('staff.loans.renew', $loan))
            ->assertSuccessful()
            ->assertJsonPath('message', 'Loan renewed successfully.')
            ->assertJsonPath('loan.id', $loan->id)
            ->assertJsonPath('loan.renewal_count', 1);

        $loan->refresh();

        $expectedDueAt = $originalDueAt
            ->copy()
            ->addDays(14)
            ->endOfDay()
            ->startOfSecond();

        expect($loan->due_at->equalTo($expectedDueAt))
            ->toBeTrue()
            ->and($loan->renewals()->count())
            ->toBe(1);
    });

    it('renewal response exposes the new due date and renewal count', function () {
        $originalDueAt = now()
            ->addDays(7)
            ->endOfDay()
            ->startOfSecond();

        $expectedDueAt = $originalDueAt
            ->copy()
            ->addDays(14)
            ->endOfDay()
            ->startOfSecond();

        $loan = Loan::factory()->create([
            'due_at' => $originalDueAt,
            'returned_at' => null,
            'return_requested_at' => null,
        ]);

        $response = $this->postJson(
            route('staff.loans.renew', $loan)
        );

        $response
            ->assertSuccessful()
            ->assertJsonPath('message', 'Loan renewed successfully.')
            ->assertJsonPath('loan.id', $loan->id)
            ->assertJsonPath('loan.due_at', $expectedDueAt->toIso8601String())
            ->assertJsonPath('loan.renewal_count', 1);

        expect(
            $loan->fresh()->due_at->equalTo($expectedDueAt)
        )->toBeTrue();
    });

    it('invalid renewal returns 422 and preserves the original due date', function () {
        $originalDueAt = now()
            ->addDays(7)
            ->endOfDay()
            ->startOfSecond();

        $loan = Loan::factory()->create([
            'due_at' => $originalDueAt,
            'returned_at' => now(),
            'return_requested_at' => null,
        ]);

        $this->postJson(route('staff.loans.renew', $loan))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('loan');

        $loan->refresh();

        expect($loan->due_at->equalTo($originalDueAt))
            ->toBeTrue()
            ->and($loan->renewals()->count())
            ->toBe(0);
    });
});
