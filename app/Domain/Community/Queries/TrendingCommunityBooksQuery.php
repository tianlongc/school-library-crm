<?php

namespace App\Domain\Community\Queries;

use App\Domain\Book\Models\Book;
use App\Domain\Community\Enums\CommunityPostStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class TrendingCommunityBooksQuery
{
    /**
     * @return Collection<int, Book>
     */
    public function getTrendingBooks(): Collection
    {
        $since = now()->subDays(7);

        $recentPublishedPosts = static function (Builder $query) use ($since): void {
            $query->where('status', CommunityPostStatus::Published->value)
                ->where('created_at', '>=', $since);
        };

        return Book::query()
            ->select(['id', 'title', 'author'])
            ->whereHas('communityPosts', $recentPublishedPosts)
            ->withCount([
                'communityPosts as discussions_count' => $recentPublishedPosts,
            ])
            ->orderByDesc('discussions_count')
            ->orderBy('books.id')
            ->limit(3)
            ->get();
    }
}
