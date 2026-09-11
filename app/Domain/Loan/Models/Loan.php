<?php

namespace App\Domain\Loan\Models;

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Policies\LoanPolicy;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Database\Factories\LoanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[UseFactory(LoanFactory::class)]
#[UsePolicy(LoanPolicy::class)]
#[Fillable('member_id', 'book_id', 'issued_by_user_id', 'returned_by_user_id', 'issued_at', 'due_at', 'return_requested_at', 'returned_at')]
class Loan extends Model
{
    /** @use HasFactory<LoanFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'due_at' => 'datetime',
            'return_requested_at' => 'datetime',
            'returned_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class)->withTrashed();
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by_user_id');
    }

    public function returnedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_by_user_id');
    }

    public function renewals(): HasMany
    {
        return $this->hasMany(LoanRenewal::class);
    }
}
