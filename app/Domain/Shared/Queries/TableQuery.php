<?php

namespace App\Domain\Shared\Queries;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
abstract class TableQuery
{
    final protected function paginateTable(Builder $query, int $page, int $perPage, string $sort, string $direction): LengthAwarePaginator {
        $direction = $direction === 'desc' ? 'desc' : 'asc';

        return $this->applySorting(
            query: $query,
            sort: $sort,
            direction: $direction,
        )
        ->orderBy($this->tieBreaker(), $direction)
        ->paginate($perPage, ['*'], 'page', $page);
    }

    abstract protected function applySorting(Builder $query, string $sort, string $direction): Builder;
    abstract protected function tieBreaker(): string;
}