<?php

use App\Models\User;
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
    'student dashboard' => 'student.dashboard',
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
    'student' => ['user', 'student.dashboard'],
    'librarian' => ['librarian', 'staff.dashboard'],
    'administrator' => ['admin', 'admin.dashboard'],
]);

it('forbids users from the staff dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    $this->actingAs($user)
        ->get(route('staff.dashboard'))
        ->assertForbidden();
});

it('renders the student dashboard only for users with student access', function () {
    $student = User::factory()->create();
    $student->assignRole('user');

    $this->actingAs($student)
        ->get(route('student.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Dashboard')
        );

    $librarian = User::factory()->create();
    $librarian->assignRole('librarian');

    $this->actingAs($librarian)
        ->get(route('student.dashboard'))
        ->assertForbidden();
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

it('renders the admin dashboard only for administrators', function () {
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
    bool $viewStudentDashboard,
) {
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Profile/Edit')
            ->where('auth.can.viewAdminDashboard', $viewAdminDashboard)
            ->where('auth.can.accessStaffWorkspace', $accessStaffWorkspace)
            ->where('auth.can.viewStudentDashboard', $viewStudentDashboard)
        );
})->with([
    'student' => ['user', false, false, true],
    'librarian' => ['librarian', false, true, false],
    'administrator' => ['admin', true, true, false],
]);
