<?php

namespace App\Domain\User\Actions;

use App\Domain\User\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class DeleteUserAccountAction
{
    public function execute(User $user): void
    {
        if ($user->hasRole('admin')) {
            throw ValidationException::withMessages([
                'password' => 'Administrator accounts cannot be deleted from profile settings.',
            ]);
        }

        Auth::logout();

        $user->deleteOrFail();
    }
}
