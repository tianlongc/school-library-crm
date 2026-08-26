<?php

namespace App\Domain\Member\Actions;

use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use Illuminate\Validation\ValidationException;

class ReactivateMemberAction
{
    public function execute(Member $member): Member
    {
        if ($member->status === MemberStatus::Active) {
            throw ValidationException::withMessages([
                'status' => 'The member is already active.',
            ]);
        }

        $member->updateOrFail([
            'status' => MemberStatus::Active,
        ]);

        return $member;
    }
}
