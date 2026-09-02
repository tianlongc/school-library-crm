<?php

namespace App\Domain\Category\Queries;

use App\Domain\Category\Models\Category;
use App\Domain\Shared\Queries\TableQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Override;

class CategoryQuery extends TableQuery
{
    /**
     * @var array<string, string>
     */
    private const SORT_COLUMNS = [
        'name' => 'categories.name',
        'created_at' => 'categories.created_at',
    ];

    protected function buildQuery(string $search): Builder
    {
        return Category::query()
            ->select(['id', 'name', 'created_at', 'updated_at'])
            ->withCount('books')
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            });
    }

    public function getCategoryList(
        string $search = '',
        int $page = 1,
        int $perPage = 10,
        string $sort = 'created_at',
        string $direction = 'desc',
    ): LengthAwarePaginator {
        return $this->paginateTable(
            query: $this->buildQuery($search),
            page: $page,
            perPage: $perPage,
            sort: $sort,
            direction: $direction,
        );
    }

    #[Override]
    protected function applySorting(Builder $query, string $sort, string $direction): Builder
    {
        $column = self::SORT_COLUMNS[$sort] ?? self::SORT_COLUMNS['created_at'];

        return $query->orderBy($column, $direction);
    }

    #[Override]
    protected function tieBreaker(): string
    {
        return 'categories.id';
    }

    /**
     * @return Collection<int, Category>
     */
    public function getOptions(): Collection
    {
        return Category::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();
    }
}
