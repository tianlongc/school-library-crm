<?php

namespace App\Domain\Book\Actions;

use App\Domain\Book\Models\Book;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        return DB::transaction(function () use ($book, $attributes): Book {
            $lockedBook = Book::query()
                ->lockForUpdate()
                ->findOrFail($book->id);

            $activeLoans = $lockedBook->loans()
                ->whereNull('returned_at')
                ->count();

            if ($attributes['total_copies'] < $activeLoans) {
                throw ValidationException::withMessages([
                    'total_copies' => "Total copies cannot be lower than the {$activeLoans} currently borrowed copies.",
                ]);
            }

            $lockedBook->updateOrFail([
                'title' => $attributes['title'],
                'author' => $attributes['author'],
                'isbn' => $attributes['isbn'],
                'description' => $attributes['description'],
                'total_copies' => $attributes['total_copies'],
                'category_id' => $attributes['category_id'],
            ]);

            return $lockedBook->refresh();
        });
    }
}
