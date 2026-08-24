<?php

namespace App\Domain\Book\Actions;

use App\Domain\Book\Models\Book;
use Illuminate\Support\Facades\DB;

class CreateBookAction
{
    /**
     * @param array{
     *      title: string,
     *      author: string,
     *      isbn: string,
     *      description: ?string,
     *      total_copies: int,
     *      category_id: ?int
     * } $attributes
     */
    public function execute(array $attributes): Book
    {
        return DB::transaction(function () use ($attributes): Book {
            $book = Book::create([
                'title' => $attributes['title'],
                'author' => $attributes['author'],
                'isbn' => $attributes['isbn'],
                'description' => $attributes['description'],
                'total_copies' => $attributes['total_copies'],
                'category_id' => $attributes['category_id'],
            ]);

            return $book;
        });
    }
}
