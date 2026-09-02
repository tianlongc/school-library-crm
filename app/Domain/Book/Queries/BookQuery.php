<?php

namespace App\Domain\Book\Queries;

use App\Domain\Book\Models\Book;
use App\Domain\Member\Models\Member;
use App\Domain\Shared\Queries\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Override;

class BookQuery extends TableQuery
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
        int $page = 1,
        int $perPage = 10,
        string $sort = 'created_at',
        string $direction = 'desc',
    ): LengthAwarePaginator {
        return $this->paginateTable(
            query: $this->buildQuery($search)->withCount([
                'loans as active_loans_count' => fn (Builder $query) => $query
                    ->whereNull('returned_at'),
            ]),
            page: $page,
            perPage: $perPage,
            sort: $sort,
            direction: $direction,
        );
    }

    #[Override]
    protected function applySorting(Builder $query, string $sort, string $direction): Builder
    {
        $sortColumn = self::SORT_COLUMNS[$sort] ?? self::SORT_COLUMNS['created_at'];

        return $query->orderBy($sortColumn, $direction);
    }

    #[Override]
    protected function tieBreaker(): string
    {
        return 'books.id';
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
