<?php

namespace App\Domain\User\Actions;

use App\Domain\User\Models\User;

class UpdateUserProfileAction
{
    /**
     * @param  array{name: string, email: string}  $attributes
     */
    public function execute(User $user, array $attributes): User
    {
        $user->fill([
            'name' => $attributes['name'],
            'email' => $attributes['email'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->saveOrFail();

        return $user;
    }
}
