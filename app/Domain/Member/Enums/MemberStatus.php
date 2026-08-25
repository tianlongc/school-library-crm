<?php

namespace App\Domain\Member\Enums;

enum MemberStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case Inactive = 'inactive';

    // Check eligiblity of a student
    public function canBorrow(): bool
    {
        return $this === self::Active;
    }
}