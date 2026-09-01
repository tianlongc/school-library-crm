<?php

namespace App\Domain\Book\Queries;

use App\Domain\Book\Models\Book;
use App\Domain\Member\Models\Member;
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
            ->withCount([
                'loans as active_loans_count' => fn (Builder $query) => $query
                    ->whereNull('returned_at'),
            ])
            ->paginate(12)
            ->withQueryString();
    }

    public function loadAvailability(Book $book): Book
    {
        return $book->loadCount([
            'loans as active_loans_count' => fn (Builder $query) => $query
                ->whereNull('returned_at'),
        ]);
    }

    public function getMemberCatalog(Member $member, string $search): LengthAwarePaginator
    {
        return $this->buildQuery($search)
            ->withCount([
                'loans as active_loans_count' => fn (Builder $query) => $query
                    ->whereNull('returned_at'),
                'loans as member_active_loans_count' => fn (Builder $query) => $query
                    ->whereBelongsTo($member)
                    ->whereNull('returned_at'),
            ])
            ->paginate(12)
            ->withQueryString();
    }
}
