<?php

namespace App\Domain\Loan\Queries;

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Models\Loan;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use App\Shared\Queries\TableQuery;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Override;

class LoanReportQuery extends TableQuery
{
    public function overdue(string $search = '', ?CarbonInterface $from = null, ?CarbonInterface $to = null): Builder
    {
        return Loan::query()
            ->select([
                'loans.id',
                'loans.member_id',
                'loans.book_id',
                'loans.issued_at',
                'loans.due_at',
                'loans.return_requested_at',
                'loans.returned_at',
            ])
            ->with([
                'member:id,user_id,member_number',
                'member.user:id,name',
                'book:id,title,isbn',
            ])
            ->whereNull('loans.returned_at')
            ->whereNull('loans.return_requested_at')
            ->where('loans.due_at', '<', now())
            ->when(
                $from !== null,
                fn (Builder $query): Builder => $query->where(
                    'loans.due_at',
                    '>=',
                    $from,
                ),
            )
            ->when(
                $to !== null,
                fn (Builder $query): Builder => $query->where(
                    'loans.due_at',
                    '<=',
                    $to,
                ),
            )
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->whereHas('member', function (Builder $query) use ($search): void {
                            $query->where(
                                'member_number',
                                'like',
                                "%{$search}%",
                            );
                        })
                        ->orWhereHas('member.user', function (Builder $query) use ($search): void {
                            $query->where(
                                'name',
                                'like',
                                "%{$search}%",
                            );
                        })
                        ->orWhereHas('book', function (Builder $query) use ($search): void {
                            $query->where(function (Builder $query) use ($search): void {
                                $query
                                    ->where('title', 'like', "%{$search}%")
                                    ->orWhere('isbn', 'like', "%{$search}%");
                        });
                    });
                });
            });
    }

    public function paginateOverdue(
        string $search = '',
        ?CarbonInterface $from = null,
        ?CarbonInterface $to = null,
        int $page = 1,
        int $perPage = 10,
        string $sort = 'due_at',
        string $direction = 'asc',
    ): LengthAwarePaginator
    {
        return $this->paginateTable(
            query: $this->overdue(
                search: $search,
                from: $from,
                to: $to,
            ),
            page: $page,
            perPage: $perPage,
            sort: $sort,
            direction: $direction,
        );
    }

    public function exportOverdue(
        string $search = '',
        ?CarbonInterface $from = null,
        ?CarbonInterface $to = null
    ): Builder
    {
        return $this->overdue(
            search: $search,
            from: $from,
            to: $to,
        )
            ->orderBy('loans.due_at')
            ->orderBy('loans.id');
    }

    #[Override]
    protected function applySorting(Builder $query, string $sort, string $direction): Builder
    {
        return match ($sort) {
            'member_name' => $query->orderBy(
                User::query()
                    ->select('users.name')
                    ->join(
                        'members',
                        'members.user_id',
                        '=',
                        'users.id',
                    )
                    ->whereColumn('members.id', 'loans.member_id')
                    ->limit(1),
                $direction,
            ),
            'member_number' => $query->orderBy(
                Member::query()
                    ->select('member_number')
                    ->whereColumn('members.id', 'loans.member_id'),
                $direction,
            ),
            'book_title' => $query->orderBy(
                Book::query()
                    ->select('title')
                    ->whereColumn('books.id', 'loans.book_id'),
                $direction,
            ),
            default => $query->orderBy(
                'loans.due_at',
                $direction,
            ),
        };
    }

    #[Override]
    protected function tieBreaker(): string
    {
        return 'loans.id';
    }
}