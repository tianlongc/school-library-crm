<?php

namespace App\Domain\Member\Queries;

use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use App\Domain\Shared\Queries\TableQuery;
use App\Domain\User\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Override;

class MemberQuery extends TableQuery
{
    /**
     * @var array<string, string>
     */
    private const SORT_COLUMNS = [
        'member_number' => 'members.member_number',
        'created_at' => 'members.created_at',
    ];

    protected function buildQuery(string $search, ?MemberStatus $status): Builder
    {
        return Member::query()
            ->select(['id', 'user_id', 'member_number', 'status', 'created_at', 'updated_at'])
            ->with(['user.roles'])
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('member_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function (Builder $query) use ($search) {
                            $query->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status !== null, fn (Builder $query) => $query->where(
                'status',
                $status->value,
            ),
            );
    }

    public function getMemberList(
        string $search = '',
        ?MemberStatus $status = null,
        int $page = 1,
        int $perPage = 10,
        string $sort = 'created_at',
        string $direction = 'desc',
    ): LengthAwarePaginator {
        return $this->paginateTable(
            query: $this->buildQuery($search, $status),
            page: $page,
            perPage: $perPage,
            sort: $sort,
            direction: $direction,
        );
    }

    #[Override]
    protected function applySorting(Builder $query, string $sort, string $direction): Builder
    {
        if ($sort === 'name') {
            return $query->orderBy(
                User::query()
                    ->select('name')
                    ->whereColumn('users.id', 'members.user_id'),
                $direction,
            );
        }

        $sortColumn = self::SORT_COLUMNS[$sort] ?? self::SORT_COLUMNS['created_at'];

        return $query->orderBy($sortColumn, $direction);
    }

    #[Override]
    protected function tieBreaker(): string
    {
        return 'members.id';
    }
}
