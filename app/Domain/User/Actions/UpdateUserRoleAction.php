<?php

namespace App\Domain\User\Actions;

use App\Domain\User\Enums\UserRole;
use App\Domain\User\Models\User;
use Illuminate\Validation\ValidationException;

class UpdateUserRoleAction
{
    public function execute(User $user, UserRole $role): User
    {
        if ($role === UserRole::Member && ! $user->member()->exists()) {
            throw ValidationException::withMessages([
                'role' => 'A Member borrowing profile must exist before assigning the member role.',
            ]);
        }

        $user->syncRoles($role->value);

        return $user->refresh()->load(['roles', 'member']);
    }
}
