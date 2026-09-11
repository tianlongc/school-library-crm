<?php

namespace App\Domain\Loan\Models;

use App\Domain\User\Models\User;
use Database\Factories\LoanRenewalFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'loan_id',
    'renewed_by_user_id',
    'previous_due_at',
    'new_due_at',
])]
#[UseFactory(LoanRenewalFactory::class)]
class LoanRenewal extends Model
{
    /** @use HasFactory<LoanRenewalFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'previous_due_at' => 'datetime',
            'new_due_at' => 'datetime',
        ];
    }

    public function loan(): BelongsTo
    {
        return $this->belongsTo(Loan::class);
    }

    public function renewedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'renewed_by_user_id',
        );
    }
}
