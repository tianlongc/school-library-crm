<?php

namespace App\Domain\Book\Actions;

use App\Domain\Book\Models\Book;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteBookAction
{
    public function execute(Book $book): void
    {
        DB::transaction(function () use ($book): void {
            $lockedBook = Book::query()
                ->lockForUpdate()
                ->findOrFail($book->id);

            $hasActiveLoans = $lockedBook->loans()
                ->whereNull('returned_at')
                ->exists();

            if ($hasActiveLoans) {
                throw ValidationException::withMessages([
                    'book' => 'Books with active loans cannot be archived.',
                ]);
            }

            $lockedBook->deleteOrFail();
        });
    }
}
