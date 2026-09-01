<?php

namespace App\Domain\Loan\Queries;

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Enums\LoanStatus;
use App\Domain\Loan\Models\Loan;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class LoanQuery
{
    public function paginate(
        string $search = '',
        LoanStatus|string|null $status = null,
        int $perPage = 10,
        string $sort = 'issued_at',
        string $direction = 'desc',
    ): LengthAwarePaginator {
        $direction = $direction === 'asc' ? 'asc' : 'desc';
        $status = is_string($status) ? LoanStatus::tryFrom($status) : $status;
        $query = Loan::query()
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
                $status === LoanStatus::Active,
                fn (Builder $query) => $query
                    ->whereNull('returned_at')
                    ->where('due_at', '>=', now())
            )
            ->when(
                $status === LoanStatus::Overdue,
                fn (Builder $query) => $query
                    ->whereNull('returned_at')
                    ->where('due_at', '<', now())
            )
            ->when(
                $status === LoanStatus::Returned,
                fn (Builder $query) => $query->whereNotNull('returned_at'),
            );

        $sortQuery = match ($sort) {
            'member_name' => User::query()
                ->select('users.name')
                ->join('members', 'members.user_id', '=', 'users.id')
                ->whereColumn('members.id', 'loans.member_id')
                ->limit(1),
            'member_number' => Member::query()
                ->select('member_number')
                ->whereColumn('members.id', 'loans.member_id'),
            'book_title' => Book::query()
                ->select('title')
                ->whereColumn('books.id', 'loans.book_id'),
            'isbn' => Book::query()
                ->select('isbn')
                ->whereColumn('books.id', 'loans.book_id'),
            default => null,
        };

        if ($sortQuery !== null) {
            $query->orderBy($sortQuery, $direction);
        } else {
            $sortColumn = in_array(
                $sort,
                ['issued_at', 'due_at', 'returned_at'],
                true,
            ) ? $sort : 'issued_at';

            $query->orderBy("loans.{$sortColumn}", $direction);
        }

        return $query
            ->orderBy('loans.id', $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
