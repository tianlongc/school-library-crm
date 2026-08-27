<?php

namespace App\Domain\Member\Queries;

use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class MemberQuery
{
    public function buildQuery(string $search, ?MemberStatus $status): Builder
    {
        return Member::query()
            ->select(['id', 'user_id', 'member_number', 'status', 'created_at', 'updated_at'])
            ->with(['user.roles']) // eager loading
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
            )
            ->latest();
    }

    public function getMemberList(string $search = '', ?MemberStatus $status = null): LengthAwarePaginator
    {
        return $this->buildQuery($search, $status)
            ->paginate(12)
            ->withQueryString();
    }
}
