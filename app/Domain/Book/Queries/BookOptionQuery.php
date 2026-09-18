<?php

namespace App\Domain\Book\Queries;

use App\Domain\Book\Models\Book;
use Illuminate\Support\Collection;

class BookOptionQuery
{
    public function get(int $limit = 100): Collection
    {
        return Book::query()
            ->select([
                'id',
                'title',
                'author',
                'isbn',
            ])
            ->orderBy('title')
            ->limit($limit)
            ->get();
    }
}
