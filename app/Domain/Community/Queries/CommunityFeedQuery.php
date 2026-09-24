<?php

namespace App\Domain\Community\Queries;

use App\Domain\Community\Enums\CommunityPostStatus;
use App\Domain\Community\Models\CommunityPost;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\CursorPaginator;

class CommunityFeedQuery
{
    public function cursorPaginate(User $viewer, ?string $cursor = null, int $perPage = 10, ?int $categoryId = null): CursorPaginator
    {
        return CommunityPost::query()
            ->where(
                'status',
                CommunityPostStatus::Published->value,
            )
            ->when(
                $categoryId !== null,
                fn (Builder $query) => $query->whereHas(
                    'book',
                    fn (Builder $bookQuery) => $bookQuery->where('category_id', $categoryId),
                ),
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
            ->cursorPaginate(
                $perPage,
                ['*'],
                'cursor',
                $cursor,
            );
    }
}
