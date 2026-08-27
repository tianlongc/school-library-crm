<?php

namespace App\Domain\Member\Models;

use App\Domain\Member\Enums\MemberStatus;
use App\Models\User;
use App\Domain\Member\Policies\MemberPolicy;
use Database\Factories\MemberFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'member_number', 'status'])]
#[UseFactory(MemberFactory::class)]
#[UsePolicy(MemberPolicy::class)]
class Member extends Model
{
    /** @use HasFactory<\Database\Factories\MemberFactory> */
    use HasFactory;

    protected $attributes = [
        'status' => MemberStatus::Active->value,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'status' => MemberStatus::class,
        ];
    }
}
