<?php

namespace App\Domain\Community\Queries;

use App\Domain\Community\Enums\CommunityPostStatus;
use App\Domain\Community\Models\CommunityPost;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class CommunityFeedQuery
{
    public function paginate(User $viewer, int $page = 1, int $perPage = 10): LengthAwarePaginator
    {
        return CommunityPost::query()
            ->where(
                'status',
                CommunityPostStatus::Published->value,
            )
            ->with([
                'author:id,name',
                'book:id,title,author,isbn',
                'media',
            ])
            ->withCount([
                'comments',
                'likes',
            ])
            ->withExists([
                'likes as liked_by_me' => fn (Builder $query) => $query
                    ->where('user_id', $viewer->id),
            ])
            ->latest('id')
            ->paginate(
                $perPage,
                ['*'],
                'page',
                $page,
            );
    }
}
