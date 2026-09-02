<?php

use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function managedAccount(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('guest is redirected from user management', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('login'));
});

test('guest cannot query user management', function () {
    $this->postJson(route('admin.users.query'))
        ->assertUnauthorized();
});

test('only administrators can view user management', function () {
    $librarian = managedAccount('librarian');

    $this->actingAs($librarian)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('only administrators can query user management', function () {
    $librarian = managedAccount('librarian');

    $this->actingAs($librarian)
        ->postJson(route('admin.users.query'))
        ->assertForbidden();
});

test('administrator can review the account directory', function () {
    $admin = managedAccount('admin');
    $memberUser = managedAccount('member');
    $member = Member::factory()->for($memberUser)->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('users.data', 2)
            ->has('users.meta')
            ->has('users.links')
            ->where('filters.search', '')
            ->where('filters.role', '')
            ->where('filters.page', 1)
            ->where('filters.per_page', 10)
            ->where('filters.sort', 'created_at')
            ->where('filters.direction', 'desc')
            ->has('roles', 3)
            ->where('users.data.0.id', $memberUser->id)
            ->where('users.data.0.member.member_number', $member->member_number)
            ->where('users.data.0.roles.0', 'member')
            ->where('users.data.0.can.update_role', true)
            ->where('users.data.1.id', $admin->id)
            ->where('users.data.1.is_current_user', true)
            ->where('users.data.1.can.update_role', false)
        );
});

test('administrator can search by member number and filter by role', function () {
    $admin = managedAccount('admin');
    $matchingUser = managedAccount('member');
    Member::factory()->for($matchingUser)->create([
        'member_number' => 'MEM654321',
    ]);
    managedAccount('librarian');

    $this->actingAs($admin)
        ->postJson(route('admin.users.query'), [
            'search' => '654321',
            'role' => 'member',
        ])
        ->assertOk()
        ->assertJsonPath('filters.search', '654321')
        ->assertJsonPath('filters.role', 'member')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $matchingUser->id);
});

test('invalid role filter is normalized', function () {
    $admin = managedAccount('admin');

    $this->actingAs($admin)
        ->postJson(route('admin.users.query'), ['role' => 'invalid'])
        ->assertOk()
        ->assertJsonPath('filters.role', '');
});

test('account directory is paginated', function () {
    $admin = managedAccount('admin');
    User::factory()->count(12)->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 10)
            ->where('users.meta.total', 13)
            ->where('users.meta.per_page', 10)
        );
});

test('administrator can sort accounts by name', function () {
    $admin = managedAccount('admin');
    $admin->update(['name' => 'Middle Admin']);
    managedAccount('librarian')->update(['name' => 'Zara Lim']);
    $alphabeticalFirst = managedAccount('librarian');
    $alphabeticalFirst->update(['name' => 'Amy Tan']);

    $this->actingAs($admin)
        ->postJson(route('admin.users.query'), [
            'sort' => 'name',
            'direction' => 'asc',
        ])
        ->assertOk()
        ->assertJsonPath('data.0.id', $alphabeticalFirst->id)
        ->assertJsonPath('filters.sort', 'name')
        ->assertJsonPath('filters.direction', 'asc');
});

test('user management accepts explicit page state without query strings', function () {
    $admin = managedAccount('admin');
    User::factory()->count(12)->create();

    $this->actingAs($admin)
        ->postJson(route('admin.users.query'), [
            'page' => 2,
            'per_page' => 5,
        ])
        ->assertOk()
        ->assertJsonCount(5, 'data')
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.per_page', 5)
        ->assertJsonPath('meta.total', 13)
        ->assertJsonPath('filters.page', 2);
});

test('administrator can change another users role', function () {
    $admin = managedAccount('admin');
    $user = managedAccount('librarian');

    $this->actingAs($admin)
        ->postJson(route('admin.users.role.update', $user), [
            'role' => 'admin',
        ])
        ->assertOk()
        ->assertJsonPath('message', 'User role updated successfully')
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.roles.0', 'admin');

    $user->refresh();

    expect($user->hasRole('admin'))->toBeTrue()
        ->and($user->hasRole('librarian'))->toBeFalse();
});

test('member role requires an existing member borrowing profile', function () {
    $admin = managedAccount('admin');
    $user = managedAccount('librarian');

    $this->actingAs($admin)
        ->postJson(route('admin.users.role.update', $user), [
            'role' => 'member',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('role');

    expect($user->fresh()->hasRole('librarian'))->toBeTrue();
});

test('administrator can assign member role when a member profile exists', function () {
    $admin = managedAccount('admin');
    $user = managedAccount('librarian');
    Member::factory()->for($user)->create();

    $this->actingAs($admin)
        ->postJson(route('admin.users.role.update', $user), [
            'role' => 'member',
        ])
        ->assertOk()
        ->assertJsonPath('user.roles.0', 'member');

    $user->refresh();

    expect($user->hasRole('member'))->toBeTrue()
        ->and($user->hasRole('librarian'))->toBeFalse();
});

test('administrator cannot change their own role', function () {
    $admin = managedAccount('admin');

    $this->actingAs($admin)
        ->postJson(route('admin.users.role.update', $admin), [
            'role' => 'librarian',
        ])
        ->assertForbidden();

    expect($admin->fresh()->hasRole('admin'))->toBeTrue();
});

test('role update validates the allowed roles', function () {
    $admin = managedAccount('admin');
    $user = managedAccount('librarian');

    $this->actingAs($admin)
        ->postJson(route('admin.users.role.update', $user), [
            'role' => 'super-admin',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('role');
});

test('librarian cannot change user roles', function () {
    $librarian = managedAccount('librarian');
    $user = managedAccount('member');

    $this->actingAs($librarian)
        ->postJson(route('admin.users.role.update', $user), [
            'role' => 'admin',
        ])
        ->assertForbidden();

    expect($user->fresh()->hasRole('member'))->toBeTrue();
});
