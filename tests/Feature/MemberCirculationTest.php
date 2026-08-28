<?php

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Models\Loan;
use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RolesAndPermissionsSeeder::class);
});

/**
 * @param  array<string, mixed>  $memberAttributes
 * @return array{User, Member}
 */
function memberCirculationAccount(array $memberAttributes = []): array
{
    $user = User::factory()->create();
    $member = Member::factory()->for($user)->create($memberAttributes);
    $user->assignRole('member');

    return [$user, $member];
}

it('requires authentication for the member catalogue', function () {
    $this->get(route('member.books.index'))
        ->assertRedirect(route('login'));
});

it('renders a searchable catalogue with availability for the signed in member', function () {
    [$user, $member] = memberCirculationAccount();
    $otherMember = Member::factory()->create();

    $matchingBook = Book::factory()->create([
        'title' => 'The Borrowers Guide',
        'total_copies' => 3,
    ]);
    Book::factory()->create(['title' => 'Unrelated Reference']);

    Loan::factory()->for($member)->for($matchingBook)->create();
    Loan::factory()->for($otherMember)->for($matchingBook)->create();

    $this->actingAs($user)
        ->get(route('member.books.index', ['search' => 'Borrowers']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Member/Books/Index')
            ->has('books.data', 1)
            ->where('books.data.0.id', $matchingBook->id)
            ->where('books.data.0.available_copies', 1)
            ->where('books.data.0.has_active_loan', true)
            ->where('filters.search', 'Borrowers')
            ->where('borrowingEligibility.eligible', true)
            ->where('borrowingEligibility.message', null)
        );
});

it('paginates the member catalogue', function () {
    [$user] = memberCirculationAccount();
    Book::factory()->count(13)->create();

    $this->actingAs($user)
        ->get(route('member.books.index', ['page' => 2]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('books.data', 1)
            ->where('books.meta.current_page', 2)
            ->where('books.meta.per_page', 12)
            ->where('books.meta.total', 13)
        );
});

it('forbids staff from member catalogue and borrowing endpoints', function () {
    $staff = User::factory()->create();
    $staff->assignRole('librarian');
    $book = Book::factory()->create();

    $this->actingAs($staff)
        ->get(route('member.books.index'))
        ->assertForbidden();

    $this->actingAs($staff)
        ->postJson(route('member.books.borrow', $book))
        ->assertForbidden();
});

it('borrows an available book for fourteen days using the member identity', function () {
    [$user, $member] = memberCirculationAccount();
    $book = Book::factory()->create(['total_copies' => 1]);
    $expectedDueAt = now()->addDays(14)->endOfDay();

    $this->actingAs($user)
        ->postJson(route('member.books.borrow', $book))
        ->assertCreated()
        ->assertJsonPath('message', 'Book borrowed successfully.')
        ->assertJsonPath('loan.member.id', $member->id)
        ->assertJsonPath('loan.book.id', $book->id)
        ->assertJsonPath('loan.status', 'active')
        ->assertJsonPath('loan.issued_by', $user->name);

    $loan = Loan::query()->sole();

    expect($loan->member_id)
        ->toBe($member->id)
        ->and($loan->issued_by_user_id)
        ->toBe($user->id)
        ->and($loan->due_at->format('Y-m-d H:i:s'))
        ->toBe($expectedDueAt->format('Y-m-d H:i:s'))
        ->and($loan->returned_at)
        ->toBeNull();
});

it('rejects members whose status cannot borrow', function (MemberStatus $status) {
    [$user] = memberCirculationAccount(['status' => $status]);
    $book = Book::factory()->create();

    $this->actingAs($user)
        ->postJson(route('member.books.borrow', $book))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('member_number');
})->with([
    'suspended' => MemberStatus::Suspended,
    'inactive' => MemberStatus::Inactive,
]);

it('rejects borrowing while the member has an overdue loan', function () {
    [$user, $member] = memberCirculationAccount();
    Loan::factory()->for($member)->create([
        'due_at' => now()->subDay(),
        'returned_at' => null,
    ]);
    $book = Book::factory()->create();

    $this->actingAs($user)
        ->postJson(route('member.books.borrow', $book))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('member_number');
});

it('rejects borrowing an unavailable book', function () {
    [$user] = memberCirculationAccount();
    $book = Book::factory()->create(['total_copies' => 1]);
    Loan::factory()->for($book)->create(['returned_at' => null]);

    $this->actingAs($user)
        ->postJson(route('member.books.borrow', $book))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('isbn');
});

it('rejects a duplicate active loan for the same member and book', function () {
    [$user, $member] = memberCirculationAccount();
    $book = Book::factory()->create(['total_copies' => 2]);
    Loan::factory()->for($member)->for($book)->create(['returned_at' => null]);

    $this->actingAs($user)
        ->postJson(route('member.books.borrow', $book))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('isbn');
});

it('allows a member to return their own loan', function () {
    [$user, $member] = memberCirculationAccount();
    $loan = Loan::factory()->for($member)->create([
        'returned_at' => null,
        'returned_by_user_id' => null,
    ]);

    $this->actingAs($user)
        ->postJson(route('member.loans.return', $loan))
        ->assertSuccessful()
        ->assertJsonPath('message', 'Loan returned successfully.')
        ->assertJsonPath('loan.status', 'returned')
        ->assertJsonPath('loan.returned_by', $user->name);

    $loan->refresh();

    expect($loan->returned_by_user_id)
        ->toBe($user->id)
        ->and($loan->returned_at)
        ->not->toBeNull();
});

it('forbids a member from returning another members loan', function () {
    [$user] = memberCirculationAccount();
    [, $otherMember] = memberCirculationAccount();
    $loan = Loan::factory()->for($otherMember)->create(['returned_at' => null]);

    $this->actingAs($user)
        ->postJson(route('member.loans.return', $loan))
        ->assertForbidden();

    expect($loan->fresh()->returned_at)->toBeNull();
});

it('rejects returning the same member loan twice', function () {
    [$user, $member] = memberCirculationAccount();
    $loan = Loan::factory()->for($member)->create(['returned_at' => null]);

    $this->actingAs($user)
        ->postJson(route('member.loans.return', $loan))
        ->assertSuccessful();

    $this->actingAs($user)
        ->postJson(route('member.loans.return', $loan))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('loan');
});

it('removes the overdue borrowing block after the overdue loan is returned', function () {
    [$user, $member] = memberCirculationAccount();
    $overdueLoan = Loan::factory()->for($member)->create([
        'due_at' => now()->subDay(),
        'returned_at' => null,
    ]);
    $nextBook = Book::factory()->create();

    $this->actingAs($user)
        ->postJson(route('member.books.borrow', $nextBook))
        ->assertUnprocessable();

    $this->actingAs($user)
        ->postJson(route('member.loans.return', $overdueLoan))
        ->assertSuccessful();

    $this->actingAs($user)
        ->postJson(route('member.books.borrow', $nextBook))
        ->assertCreated();
});
