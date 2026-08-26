<?php

namespace App\Domain\Book\Queries;

use App\Domain\Book\Models\Book;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class BookQuery
{
    public function buildQuery(string $search): Builder
    {
        return Book::query()
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%");
                });
            })
            ->with('category:id,name')
            ->latest();
    }

    public function getBookList(string $search): LengthAwarePaginator
    {
        return $this->buildQuery($search)
            ->paginate(12)
            ->withQueryString();
    }
}
