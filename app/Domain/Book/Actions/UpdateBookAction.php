<?php

namespace App\Domain\Book\Actions;

use App\Domain\Book\Models\Book;
use Illuminate\Support\Facades\DB;

class UpdateBookAction
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
    public function execute(Book $book, array $attributes): Book
    {
        DB::transaction(function () use ($book, $attributes): void {
            $book->update([
                'title' => $attributes['title'],
                'author' => $attributes['author'],
                'isbn' => $attributes['isbn'],
                'description' => $attributes['description'],
                'total_copies' => $attributes['total_copies'],
                'category_id' => $attributes['category_id'],
            ]);
        });

        return $book;
    }
}
