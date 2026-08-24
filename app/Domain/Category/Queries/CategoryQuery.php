<?php

namespace App\Domain\Category\Queries;

use App\Domain\Category\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class CategoryQuery
{
    public function buildQuery(string $search): Builder
    {
        return Category::query()
            ->select(['id', 'name', 'created_at', 'updated_at'])
            ->withCount('books')
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest();
    }

    public function getCategoryList(string $search): LengthAwarePaginator
    {
        return $this->buildQuery($search)
            ->paginate(12)
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
