<?php

namespace App\Domain\Member\Policies;

use App\Domain\Member\Models\Member;
use App\Models\User;

class MemberPolicy
{
    public function viewDashboard(User $user, Member $member): bool
    {
        return $user->is($member->user) && $user->can('member.dashboard.view');
    }
}
