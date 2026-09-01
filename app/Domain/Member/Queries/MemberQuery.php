<?php

namespace App\Domain\Member\Queries;

use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class MemberQuery
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
        int $perPage = 10,
        string $sort = 'created_at',
        string $direction = 'desc',
    ): LengthAwarePaginator {
        $direction = $direction === 'asc' ? 'asc' : 'desc';
        $query = $this->buildQuery($search, $status);

        if ($sort === 'name') {
            $query->orderBy(
                User::query()
                    ->select('name')
                    ->whereColumn('users.id', 'members.user_id'),
                $direction,
            );
        } else {
            $query->orderBy(
                self::SORT_COLUMNS[$sort] ?? self::SORT_COLUMNS['created_at'],
                $direction,
            );
        }

        return $query
            ->orderBy('members.id', $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
