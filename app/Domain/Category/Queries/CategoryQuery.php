<?php

namespace App\Domain\Category\Queries;

use App\Domain\Category\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class CategoryQuery
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
        int $perPage = 10,
        string $sort = 'created_at',
        string $direction = 'desc',
    ): LengthAwarePaginator {
        $direction = $direction === 'asc' ? 'asc' : 'desc';
        $sortColumn = self::SORT_COLUMNS[$sort] ?? self::SORT_COLUMNS['created_at'];

        return $this->buildQuery($search)
            ->orderBy($sortColumn, $direction)
            ->orderBy('categories.id', $direction)
            ->paginate($perPage)
            ->withQueryString();
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
