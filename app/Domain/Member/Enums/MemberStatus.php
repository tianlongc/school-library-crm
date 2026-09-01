<?php

namespace App\Domain\Member\Enums;

enum MemberStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case Inactive = 'inactive';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Suspended => 'Suspended',
            self::Inactive => 'Inactive',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn (self $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ],
            self::cases(),
        );
    }

    public function canBorrow(): bool
    {
        return $this === self::Active;
    }

    public function canBrowseCatalogue(): bool
    {
        return $this !== self::Inactive;
    }
}
