<?php

namespace App\Domain\User\Queries;

use App\Domain\Member\Models\Member;
use App\Domain\Shared\Queries\TableQuery;
use App\Domain\User\Enums\UserRole;
use App\Domain\User\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Override;

class UserQuery extends TableQuery
{
    protected function buildQuery(string $search, ?UserRole $role): Builder
    {
        return User::query()
            ->select([
                'id',
                'name',
                'email',
                'email_verified_at',
                'created_at',
                'updated_at',
            ])
            ->with([
                'roles:id,name',
                'member:id,user_id,member_number,status',
            ])
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('member', fn (Builder $query) => $query
                            ->where('member_number', 'like', "%{$search}%"));
                });
            })
            ->when($role !== null, fn (Builder $query) => $query
                ->whereHas('roles', fn (Builder $query) => $query
                    ->where('name', $role->value)));
    }

    public function getUserList(
        string $search = '',
        ?UserRole $role = null,
        int $page = 1,
        int $perPage = 10,
        string $sort = 'created_at',
        string $direction = 'desc',
    ): LengthAwarePaginator {
        return $this->paginateTable(
            query: $this->buildQuery($search, $role),
            page: $page,
            perPage: $perPage,
            sort: $sort,
            direction: $direction,
        );
    }

    #[Override]
    protected function applySorting(Builder $query, string $sort, string $direction): Builder
    {
        if ($sort === 'member_number') {
            return $query->orderBy(
                Member::query()
                    ->select('member_number')
                    ->whereColumn('members.user_id', 'users.id')
                    ->limit(1),
                $direction,
            );
        }

        $sortColumn = $sort === 'name' ? 'users.name' : 'users.created_at';

        return $query->orderBy($sortColumn, $direction);
    }

    #[Override]
    protected function tieBreaker(): string
    {
        return 'users.id';
    }
}
