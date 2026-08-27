<?php

use App\Domain\Member\Models\Member;
use App\Domain\User\Actions\CreateUserAction;
use App\Domain\User\Actions\DeleteUserAccountAction;
use App\Domain\User\Actions\UpdateUserPasswordAction;
use App\Domain\User\Actions\UpdateUserProfileAction;
use App\Domain\User\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

it('creates a user with a hashed password', function () {
    $user = app(CreateUserAction::class)->execute([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
    ]);

    expect($user->name)->toBe('Test User')
        ->and($user->email)->toBe('test@example.com')
        ->and(Hash::check('password', $user->password))->toBeTrue();
});

it('updates a user profile and resets verification after an email change', function () {
    $user = User::factory()->create();

    $updatedUser = app(UpdateUserProfileAction::class)->execute($user, [
        'name' => 'Updated User',
        'email' => 'updated@example.com',
    ]);

    expect($updatedUser->name)->toBe('Updated User')
        ->and($updatedUser->email)->toBe('updated@example.com')
        ->and($updatedUser->email_verified_at)->toBeNull();
});

it('updates a user password', function () {
    $user = User::factory()->create();

    app(UpdateUserPasswordAction::class)->execute($user, 'new-password');

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

it('deletes a user and their member record', function () {
    $user = User::factory()->create();
    $member = Member::factory()->for($user)->create();

    $this->actingAs($user);

    app(DeleteUserAccountAction::class)->execute($user);

    $this->assertGuest();
    $this->assertModelMissing($user);
    $this->assertModelMissing($member);
});

it('prevents administrator accounts from being deleted', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);

    expect(fn () => app(DeleteUserAccountAction::class)->execute($admin))
        ->toThrow(ValidationException::class);

    $this->assertAuthenticatedAs($admin);
    $this->assertModelExists($admin);
});
