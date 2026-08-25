<?php

namespace App\Domain\Member\Actions;

use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegisterMemberAction
{
    /**
     * @param  array{name: string, email: string, password: string}  $attributes
     */
    public function execute(array $attributes): User
    {
        return DB::transaction(function () use ($attributes): User {
            $user = User::create([
                'name' => $attributes['name'],
                'email' => $attributes['email'],
                'password' => Hash::make($attributes['password']),
            ]);

            $member = Member::create([
                'user_id' => $user->id,
                'member_number' => 'pending-'.Str::ulid(),
                'status' => MemberStatus::Active,
            ]);

            $member->forceFill([
                'member_number' => sprintf('MEM%06d', $member->id),
            ])->saveOrFail();

            $user->assignRole('member');

            return $user->load('member');
        });
    }
}
