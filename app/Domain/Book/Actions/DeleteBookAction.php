<?php

namespace App\Domain\Book\Actions;

use App\Domain\Book\Models\Book;

class DeleteBookAction
{
    public function execute(Book $book): void
    {
        $book->deleteOrFail();
    }
}
