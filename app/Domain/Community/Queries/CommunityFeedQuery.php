<?php

namespace App\Domain\Community\Queries;

use App\Domain\Community\Enums\CommunityPostStatus;
use App\Domain\Community\Models\CommunityPost;
use Illuminate\Pagination\LengthAwarePaginator;

class CommunityFeedQuery
{
    public function paginate(int $page = 1, int $perPage = 10): LengthAwarePaginator
    {
        return CommunityPost::query()
            ->where(
                'status',
                CommunityPostStatus::Published->value,
            )
            ->with([
                'author:id,name',
                'book:id,title,author,isbn',
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
