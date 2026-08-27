<?php

namespace App\Domain\Loan\Queries;

use App\Domain\Loan\Enums\LoanStatus;
use App\Domain\Loan\Models\Loan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class LoanQuery
{
    public function paginate(string $search = '', ?string $status = null): LengthAwarePaginator
    {
        return Loan::query()
            ->with([
                'member.user',
                'book',
                'issuedBy',
                'returnedBy',
            ])
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $query) use ($search) {
                    $query
                        ->whereHas('member', function (Builder $query) use ($search) {
                            $query->where('member_number', 'like', "%{$search}%");
                        })
                        ->orWhereHas('member.user', function (Builder $query) use ($search) {
                            $query->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('book', function (Builder $query) use ($search) {
                            $query->where(function (Builder $query) use ($search) {
                                $query
                                    ->where('title', 'like', "%{$search}%")
                                    ->orWhere('isbn', 'like', "%{$search}%");
                            });
                        });
                });
            })
            ->when(
                $status === LoanStatus::Active->value,
                fn (Builder $query) => $query
                    ->whereNull('returned_at')
                    ->where('due_at', '>=', now())
            )
            ->when(
                $status === LoanStatus::Overdue->value,
                fn (Builder $query) => $query
                    ->whereNull('returned_at')
                    ->where('due_at', '<', now())
            )
            ->when(
                $status === LoanStatus::Returned->value,
                fn (Builder $query) => $query->whereNotNull('returned_at'),
            )
            ->orderByDesc('issued_at')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();
    }
}
