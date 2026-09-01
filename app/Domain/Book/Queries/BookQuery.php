<?php

namespace App\Domain\Book\Queries;

use App\Domain\Book\Models\Book;
use App\Domain\Member\Models\Member;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class BookQuery
{
    /**
     * @var array<string, string>
     */
    private const SORT_COLUMNS = [
        'title' => 'books.title',
        'author' => 'books.author',
        'isbn' => 'books.isbn',
        'created_at' => 'books.created_at',
    ];

    protected function buildQuery(string $search): Builder
    {
        return Book::query()
            ->when(
                $search !== '',
                function (Builder $query) use ($search): void {
                    $query->where(
                        function (Builder $query) use ($search): void {
                            $query->where('title', 'like', "%{$search}%")
                                ->orWhere('author', 'like', "%{$search}%")
                                ->orWhere('isbn', 'like', "%{$search}%");
                        },
                    );
                },
            )
            ->with('category:id,name');
    }

    public function getBookList(
        string $search = '',
        int $perPage = 10,
        string $sort = 'created_at',
        string $direction = 'desc',
    ): LengthAwarePaginator {
        $direction = $direction === 'asc' ? 'asc' : 'desc';

        $sortColumn = self::SORT_COLUMNS[$sort] ?? self::SORT_COLUMNS['created_at'];

        return $this->buildQuery($search)
            ->withCount([
                'loans as active_loans_count' => fn (Builder $query) => $query
                    ->whereNull('returned_at'),
            ])
            ->orderBy($sortColumn, $direction)
            ->orderBy('books.id', $direction)
            ->paginate($perPage)
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
            ->orderByDesc('books.created_at')
            ->orderByDesc('books.id')
            ->paginate(12)
            ->withQueryString();
    }
}
