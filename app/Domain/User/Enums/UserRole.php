<?php

namespace App\Domain\User\Enums;

enum UserRole: string
{
    case Member = 'member';
    case Librarian = 'librarian';
    case Admin = 'admin';

    /**
     * @return array<int, array{label: string, value: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $role): array => [
                'label' => $role->label(),
                'value' => $role->value,
            ],
            self::cases(),
        );
    }

    public function label(): string
    {
        return match ($this) {
            self::Member => 'Member',
            self::Librarian => 'Librarian',
            self::Admin => 'Administrator',
        };
    }
}
