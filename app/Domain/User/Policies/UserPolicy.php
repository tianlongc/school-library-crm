<?php

namespace App\Domain\User\Policies;

use App\Domain\User\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.view');
    }

    public function updateRole(User $actor, User $user): bool
    {
        return $actor->can('users.roles.update') && ! $actor->is($user);
    }
}
