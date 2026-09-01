<?php

namespace App\Domain\User\Queries;

use App\Domain\Member\Models\Member;
use App\Domain\User\Enums\UserRole;
use App\Domain\User\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class UserQuery
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
        int $perPage = 10,
        string $sort = 'created_at',
        string $direction = 'desc',
    ): LengthAwarePaginator {
        $direction = $direction === 'asc' ? 'asc' : 'desc';
        $query = $this->buildQuery($search, $role);

        if ($sort === 'member_number') {
            $query->orderBy(
                Member::query()
                    ->select('member_number')
                    ->whereColumn('members.user_id', 'users.id')
                    ->limit(1),
                $direction,
            );
        } else {
            $query->orderBy(
                $sort === 'name' ? 'users.name' : 'users.created_at',
                $direction,
            );
        }

        return $query
            ->orderBy('users.id', $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
