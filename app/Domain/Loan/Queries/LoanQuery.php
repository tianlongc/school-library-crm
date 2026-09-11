<?php

namespace App\Domain\Loan\Queries;

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Enums\LoanStatus;
use App\Domain\Loan\Models\Loan;
use App\Domain\Member\Models\Member;
use App\Domain\Shared\Queries\TableQuery;
use App\Domain\User\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Override;

class LoanQuery extends TableQuery
{
    public function paginate(
        string $search = '',
        LoanStatus|string|null $status = null,
        int $page = 1,
        int $perPage = 10,
        string $sort = 'issued_at',
        string $direction = 'desc',
    ): LengthAwarePaginator {
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
                    ->whereNull('return_requested_at')
                    ->where('due_at', '>=', now())
            )
            ->when(
                $status === LoanStatus::Overdue,
                fn (Builder $query) => $query
                    ->whereNull('returned_at')
                    ->whereNull('return_requested_at')
                    ->where('due_at', '<', now())
            )
            ->when(
                $status === LoanStatus::Returned,
                fn (Builder $query) => $query->whereNotNull('returned_at'),
            )
            ->when(
                $status === LoanStatus::ReturnRequested,
                fn (Builder $query) => $query
                    ->whereNull('returned_at')
                    ->whereNotNull('return_requested_at'),
            )
            ->withCount('renewals');

        return $this->paginateTable(
            query: $query,
            page: $page,
            perPage: $perPage,
            sort: $sort,
            direction: $direction,
        );
    }

    #[Override]
    protected function applySorting(Builder $query, string $sort, string $direction): Builder
    {
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
            return $query->orderBy($sortQuery, $direction);
        }

        $sortColumn = in_array(
            $sort,
            ['issued_at', 'due_at', 'returned_at'],
            true,
        ) ? $sort : 'issued_at';

        return $query->orderBy("loans.{$sortColumn}", $direction);
    }

    #[Override]
    protected function tieBreaker(): string
    {
        return 'loans.id';
    }
}
