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

test('guest is redirected away from loan management', function () {
    $this->get(route('staff.loans.index'))
        ->assertRedirect(route('login'));
});

test('member cannot access loan management', function () {
    $member = loanStaffWithRole('member');

    $this->actingAs($member)
        ->get(route('staff.loans.index'))
        ->assertForbidden();
});

describe('authenticated loan management', function () {
    beforeEach(function () {
        $this->staff = loanStaffWithRole();
        $this->actingAs($this->staff);
    });

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

        $this->get(route('staff.loans.index', ['status' => 'return_requested']))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->has('loans.data', 1)
                ->where('loans.data.0.id', $requestedLoan->id)
                ->where('loans.data.0.status', 'return_requested')
                ->where('filters.status', 'return_requested')
            );
    });

    it('normalizes invalid loan table parameters', function () {
        $this->get(route('staff.loans.index', [
            'per_page' => 999,
            'sort' => 'status',
            'direction' => 'sideways',
        ]))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.per_page', 10)
                ->where('filters.sort', 'issued_at')
                ->where('filters.direction', 'desc')
            );
    });

    it('normalizes an invalid status filter', function () {
        $this->get(route('staff.loans.index', ['status' => 'invalid']))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.status', '')
            );
    });

    it('renders the issue loan page', function () {
        $this->get(route('staff.loans.create'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Staff/Loans/Create')
            );
    });

    it('issues a loan from valid json', function () {
        $member = Member::factory()->create();
        $book = Book::factory()->create(['total_copies' => 1]);

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

    it('returns an active loan', function () {
        $loan = Loan::factory()->create([
            'returned_at' => null,
            'returned_by_user_id' => null,
        ]);

        $this->postJson(route('staff.loans.return', $loan))
            ->assertSuccessful()
            ->assertJsonPath('message', 'Book received and loan completed.')
            ->assertJsonPath('loan.id', $loan->id)
            ->assertJsonPath('loan.status', 'returned')
            ->assertJsonPath('loan.returned_by', $this->staff->name);

        $returnedLoan = $loan->fresh();

        expect($returnedLoan->returned_by_user_id)
            ->toBe($this->staff->id)
            ->and($returnedLoan->returned_at)
            ->not->toBeNull();
    });

    it('confirms a member requested return', function () {
        $requestedAt = now()->subMinute()->startOfSecond();
        $loan = Loan::factory()->create([
            'return_requested_at' => $requestedAt,
            'returned_at' => null,
            'returned_by_user_id' => null,
        ]);

        $this->postJson(route('staff.loans.return', $loan))
            ->assertSuccessful()
            ->assertJsonPath('message', 'Book received and loan completed.')
            ->assertJsonPath('loan.status', 'returned')
            ->assertJsonPath('loan.returned_by', $this->staff->name);

        $loan->refresh();

        expect($loan->return_requested_at->equalTo($requestedAt))
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
});
