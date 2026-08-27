<?php

use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();

    $this->seed(RolesAndPermissionsSeeder::class);
});

function userWithRole(string $role): User
{
    $user = User::factory()->create();

    $user->assignRole($role);

    return $user;
}

test('guest is redirected to login', function () {
    $this->get(route('staff.members.index'))
        ->assertRedirect(route('login'));
});

test('member cannot view member directory', function () {
    $user = userWithRole('member');

    $this->actingAs($user)
        ->get(route('staff.members.index'))
        ->assertForbidden();
});

test('librarian can view member directory', function () {
    $user = userWithRole('librarian');

    Member::factory()->count(3)->create();

    $this->actingAs($user)
        ->get(route('staff.members.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Staff/Members/Index')
            ->has('members.data')
            ->has('members.meta')
            ->has('members.links')
            ->has('filters.search')
            ->has('filters.status')
            ->has('statuses', 3)
            ->where('can.suspend', true)
            ->where('can.deactivate', true)
            ->where('can.reactivate', false)
        );
});

test('admin can view member directory', function () {
    $user = userWithRole('admin');

    $this->actingAs($user)
        ->get(route('staff.members.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Staff/Members/Index')
            ->where('can.suspend', true)
            ->where('can.deactivate', true)
            ->where('can.reactivate', true)
        );
});

test('filters are returned to inertia', function () {
    $user = userWithRole('librarian');

    $this->actingAs($user)
        ->get(route('staff.members.index', [
            'search' => 'John',
            'status' => 'active',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.search', 'John')
            ->where('filters.status', 'active')
        );
});

test('invalid status is normalized to empty status', function () {
    $user = userWithRole('librarian');

    $this->actingAs($user)
        ->get(route('staff.members.index', [
            'status' => 'something-invalid',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.status', '')
        );
});

test('librarian can suspend an active member', function () {
    $user = userWithRole('librarian');

    $member = Member::factory()->create([
        'status' => MemberStatus::Active,
    ]);

    $this->actingAs($user)
        ->postJson(route('staff.members.suspend', $member))
        ->assertOk()
        ->assertJsonPath(
            'message',
            'Member suspended successfully',
        )
        ->assertJsonPath('member.id', $member->id)
        ->assertJsonPath(
            'member.status',
            MemberStatus::Suspended->value,
        );

    expect($member->fresh()->status)
        ->toBe(MemberStatus::Suspended);
});

test('librarian can deactivate an active member', function () {
    $user = userWithRole('librarian');

    $member = Member::factory()->create([
        'status' => MemberStatus::Active,
    ]);

    $this->actingAs($user)
        ->postJson(route('staff.members.deactivate', $member))
        ->assertOk()
        ->assertJsonPath(
            'message',
            'Member deactivated successfully',
        )
        ->assertJsonPath('member.id', $member->id)
        ->assertJsonPath(
            'member.status',
            MemberStatus::Inactive->value,
        );

    expect($member->fresh()->status)
        ->toBe(MemberStatus::Inactive);
});

test('librarian cannot reactivate a member', function () {
    $user = userWithRole('librarian');

    $member = Member::factory()->create([
        'status' => MemberStatus::Suspended,
    ]);

    $this->actingAs($user)
        ->postJson(route('staff.members.reactivate', $member))
        ->assertForbidden();

    expect($member->fresh()->status)
        ->toBe(MemberStatus::Suspended);
});

test('admin can reactivate a suspended member', function () {
    $user = userWithRole('admin');

    $member = Member::factory()->create([
        'status' => MemberStatus::Suspended,
    ]);

    $this->actingAs($user)
        ->postJson(route('staff.members.reactivate', $member))
        ->assertOk()
        ->assertJsonPath(
            'message',
            'Member reactivated successfully',
        )
        ->assertJsonPath('member.id', $member->id)
        ->assertJsonPath(
            'member.status',
            MemberStatus::Active->value,
        );

    expect($member->fresh()->status)
        ->toBe(MemberStatus::Active);
});

test('unknown member returns 404', function () {
    $user = userWithRole('admin');

    $this->actingAs($user)
        ->postJson(route('staff.members.suspend', [
            'member' => 999999,
        ]))
        ->assertNotFound();
});

test('member cannot change another members status', function (
    string $routeName,
) {
    $user = userWithRole('member');
    $member = Member::factory()->create();

    $this->actingAs($user)
        ->postJson(route($routeName, $member))
        ->assertForbidden();
})->with([
    'suspend' => 'staff.members.suspend',
    'deactivate' => 'staff.members.deactivate',
    'reactivate' => 'staff.members.reactivate',
]);

test('suspending an already suspended member returns validation errors', function () {
    $librarian = userWithRole('librarian');
    $member = Member::factory()->suspended()->create();

    $this->actingAs($librarian)
        ->postJson(route('staff.members.suspend', $member))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('status');

    expect($member->fresh()->status)
        ->toBe(MemberStatus::Suspended);
});
