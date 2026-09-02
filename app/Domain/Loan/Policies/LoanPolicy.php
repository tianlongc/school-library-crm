<?php

namespace App\Domain\Loan\Policies;

use App\Domain\Loan\Models\Loan;
use App\Domain\User\Models\User;

class LoanPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('loans.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('loans.issue');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Loan $loan): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Loan $loan): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Loan $loan): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Loan $loan): bool
    {
        return false;
    }

    public function returnLoan(User $user, Loan $loan): bool
    {
        return $user->can('loans.return');
    }

    public function requestReturn(User $user, Loan $loan): bool
    {
        return $user->can('loans.return-own') && $user->member?->getKey() === $loan->member_id;
    }

    public function borrow(User $user): bool
    {
        return $user->can('loans.borrow') && $user->member()->exists();
    }
}
