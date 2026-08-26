<?php

namespace App\Domain\Member\Actions;

use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use Illuminate\Validation\ValidationException;

class SuspendMemberAction
{
    public function execute(Member $member): Member
    {
        if ($member->status !== MemberStatus::Active) {
            throw ValidationException::withMessages([
                'status' => 'Only active members can be suspended.',
            ]);
        }

        $member->updateOrFail([
            'status' => MemberStatus::Suspended,
        ]);

        return $member;
    }
}
