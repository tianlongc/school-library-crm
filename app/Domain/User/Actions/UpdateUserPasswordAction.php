<?php

namespace App\Domain\User\Actions;

use App\Domain\User\Models\User;
use Illuminate\Support\Facades\Hash;

class UpdateUserPasswordAction
{
    public function execute(User $user, string $password): void
    {
        $user->updateOrFail([
            'password' => Hash::make($password),
        ]);
    }
}
