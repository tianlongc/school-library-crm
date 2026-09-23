<?php

use App\Domain\Loan\Models\Loan;
use App\Domain\User\Models\User;
use App\Exports\OverdueLoansExport;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Maatwebsite\Excel\Facades\Excel;

beforeEach(function (): void {
    $this->withoutVite();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->travelTo(Carbon::parse('2026-09-22 12:00:00'));
});

afterEach(function (): void {
    $this->travelBack();
});

function overdueReportUser(string $role = 'librarian'): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

it('redirects guests from the overdue report', function (): void {
    $this->get(route('staff.reports.overdue'))
        ->assertRedirect(route('login'));
});

it('forbids members from the overdue report', function (): void {
    $member = overdueReportUser('member');

    $this->actingAs($member)
        ->get(route('staff.reports.overdue'))
        ->assertForbidden();
});

it('renders the overdue report for staff', function (): void {
    $staff = overdueReportUser();

    $this->actingAs($staff)
        ->get(route('staff.reports.overdue'))
        ->assertSuccessful()
        ->assertInertia(
            fn (Assert $page): Assert => $page
                ->component('Staff/Reports/Overdue'),
        );
});

it('returns filtered overdue report rows', function (): void {
    $staff = overdueReportUser();

    $loan = Loan::factory()->create([
        'due_at' => now()->subDays(2),
        'return_requested_at' => null,
        'returned_at' => null,
    ]);

    $this->actingAs($staff)
        ->postJson(route('staff.reports.overdue.query'), [
            'search' => $loan->member->member_number,
        ])
        ->assertSuccessful()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $loan->id)
        ->assertJsonPath('data.0.overdue_days', 2)
        ->assertJsonPath('filters.search', $loan->member->member_number);
});

it('downloads the filtered overdue report', function (): void {
    Excel::fake();

    $staff = overdueReportUser();

    $this->actingAs($staff)
        ->get(route('staff.reports.overdue.export'))
        ->assertSuccessful();

    Excel::assertDownloaded(
        'overdue-loans-2026-09-22.xlsx',
        fn (OverdueLoansExport $export): bool => true,
    );
});