<?php

namespace App\Domain\Member\Models;

use App\Domain\Loan\Models\Loan;
use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Policies\MemberPolicy;
use App\Domain\User\Models\User;
use Database\Factories\MemberFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'member_number', 'status'])]
#[UseFactory(MemberFactory::class)]
#[UsePolicy(MemberPolicy::class)]
class Member extends Model
{
    /** @use HasFactory<MemberFactory> */
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

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function hasOverdueLoans(): bool
    {
        return $this->loans()->whereNull('returned_at')->where('due_at', '<', now())->exists();
    }
}
