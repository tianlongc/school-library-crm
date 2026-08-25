<?php

use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertSuccessful();
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::where('email', 'test@example.com')->with('member')->firstOrFail();

    expect($user->getRoleNames()->all())
        ->toHaveCount(1)
        ->toContain('member');

    expect($user->hasRole('member'))->toBeTrue()
        ->and($user->can('member.dashboard.view'))->toBeTrue()
        ->and($user->can('workspace.access'))->toBeFalse()
        ->and($user->member)->toBeInstanceOf(Member::class)
        ->and($user->member->status)->toBe(MemberStatus::Active)
        ->and($user->member->member_number)->toMatch('/^MEM\d{6}$/');

    $this->get(route('member.dashboard'))
        ->assertSuccessful();
});
