<?php

use App\Domain\Loan\Models\Loan;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('redirects guests from protected role dashboards', function (string $routeName) {
    $this->get(route($routeName))
        ->assertRedirect(route('login'));
})->with([
    'member dashboard' => 'member.dashboard',
    'staff dashboard' => 'staff.dashboard',
    'admin dashboard' => 'admin.dashboard',
]);

it('redirects each role from the generic dashboard to its home', function (string $role, string $dashboardRoute) {
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user)
        ->get(route('dashboard', ['source' => 'navigation']))
        ->assertRedirect(route($dashboardRoute, ['source' => 'navigation']));
})->with([
    'member' => ['member', 'member.dashboard'],
    'librarian' => ['librarian', 'staff.dashboard'],
    'administrator' => ['admin', 'staff.dashboard'],
]);

it('forbids members from the staff dashboard', function () {
    $member = User::factory()->create();
    $member->assignRole('member');

    $this->actingAs($member)
        ->get(route('staff.dashboard'))
        ->assertForbidden();
});

it('renders the member dashboard only for users with member access', function () {
    $member = User::factory()->create();
    $memberProfile = Member::factory()->for($member)->create([
        'member_number' => 'LIB-2026-0042',
    ]);
    $member->assignRole('member');

    $this->actingAs($member)
        ->get(route('member.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Member/Dashboard')
            ->where('member.member_number', $memberProfile->member_number)
            ->where('member.status', $memberProfile->status->value)
        );

    $librarian = User::factory()->create();
    $librarian->assignRole('librarian');

    $this->actingAs($librarian)
        ->get(route('member.dashboard'))
        ->assertForbidden();
});

it('shows only the signed in members current loans', function () {
    $user = User::factory()->create();
    $member = Member::factory()->for($user)->create();
    $user->assignRole('member');

    $currentLoan = Loan::factory()->for($member, 'member')->create([
        'due_at' => now()->addWeek(),
        'returned_at' => null,
    ]);
    Loan::factory()->for($member, 'member')->create([
        'returned_at' => now()->subDay(),
    ]);
    Loan::factory()->create(['returned_at' => null]);

    $this->actingAs($user)
        ->get(route('member.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Member/Dashboard')
            ->has('currentLoans', 1)
            ->where('currentLoans.0.id', $currentLoan->id)
            ->where('currentLoans.0.status', 'active')
            ->where('currentLoans.0.returned_at', null)
        );
});

it('renders the staff dashboard for authorized staff', function (string $role) {
    $staff = User::factory()->create();
    $staff->assignRole($role);

    $this->actingAs($staff)
        ->get(route('staff.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Staff/Dashboard')
        );
})->with([
    'librarian' => 'librarian',
    'admin' => 'admin',
]);

it('renders user management only for administrators', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
        );

    $librarian = User::factory()->create();
    $librarian->assignRole('librarian');

    $this->actingAs($librarian)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

it('shares the navigation capabilities used by account settings', function (
    string $role,
    bool $viewAdminDashboard,
    bool $accessStaffWorkspace,
    bool $viewMemberDashboard,
    bool $viewLoans,
    bool $issueLoans,
    bool $returnLoans,
    bool $borrowBooks,
) {
    $user = User::factory()->create();
    $user->assignRole($role);

    if ($role === 'member') {
        Member::factory()->for($user)->create();
    }

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Profile/Edit')
            ->where('auth.can.viewAdminDashboard', $viewAdminDashboard)
            ->where('auth.can.accessStaffWorkspace', $accessStaffWorkspace)
            ->where('auth.can.viewMemberDashboard', $viewMemberDashboard)
            ->where('auth.can.viewLoans', $viewLoans)
            ->where('auth.can.issueLoans', $issueLoans)
            ->where('auth.can.returnLoans', $returnLoans)
            ->where('auth.can.borrowBooks', $borrowBooks)
        );
})->with([
    'member' => ['member', false, false, true, false, false, false, true],
    'librarian' => ['librarian', false, true, false, true, true, true, false],
    'administrator' => ['admin', true, true, false, true, true, true, false],
]);
