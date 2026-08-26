<?php

namespace App\Domain\Member\Actions;

use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use Illuminate\Validation\ValidationException;

class DeactivateMemberAction
{
    public function execute(Member $member): Member
    {
        if ($member->status === MemberStatus::Inactive) {
            throw ValidationException::withMessages([
                'status' => 'The member is already inactive.',
            ]);
        }

        $member->updateOrFail([
            'status' => MemberStatus::Inactive,
        ]);

        return $member;
    }
}
