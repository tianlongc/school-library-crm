<?php

namespace App\Domain\Member\Policies;

use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;

class MemberPolicy
{
    public function viewDashboard(User $user, Member $member): bool
    {
        return $user->is($member->user) && $user->can('member.dashboard.view');
    }

    public function viewAny(User $user): bool
    {
        return $user->can('members.view');
    }

    public function suspend(User $user, Member $member): bool
    {
        return $user->can('members.suspend');
    }

    public function deactivate(User $user, Member $member): bool
    {
        return $user->can('members.deactivate');
    }

    public function reactivate(User $user, Member $member): bool
    {
        return $user->can('members.reactivate');
    }

    public function browseCatalogue(User $user, Member $member): bool
    {
        return $this->viewDashboard($user, $member) && $member->status->canBrowseCatalogue();
    }
}
