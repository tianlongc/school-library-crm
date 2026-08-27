<?php

use App\Domain\Book\Actions\DeleteBookAction;
use App\Domain\Book\Actions\UpdateBookAction;
use App\Domain\Book\Models\Book;
use App\Domain\Loan\Models\Loan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

/**
 * @param  array<string, mixed>  $overrides
 * @return array{
 *     title: string,
 *     author: string,
 *     isbn: string,
 *     description: ?string,
 *     total_copies: int,
 *     category_id: ?int
 * }
 */
function validBookActionAttributes(Book $book, array $overrides = []): array
{
    return array_merge([
        'title' => $book->title,
        'author' => $book->author,
        'isbn' => $book->isbn,
        'description' => $book->description,
        'total_copies' => $book->total_copies,
        'category_id' => $book->category_id,
    ], $overrides);
}

describe('update book', function () {
    it('rejects lowering total copies below the number of active loans', function () {
        $book = Book::factory()->create([
            'title' => 'Original title',
            'total_copies' => 3,
        ]);

        Loan::factory()
            ->count(2)
            ->for($book, 'book')
            ->create(['returned_at' => null]);

        expect(fn () => app(UpdateBookAction::class)->execute(
            book: $book,
            attributes: validBookActionAttributes($book, [
                'title' => 'Changed title',
                'total_copies' => 1,
            ]),
        ))->toThrow(ValidationException::class);

        expect($book->refresh())
            ->title->toBe('Original title')
            ->total_copies->toBe(3);
    });

    it('allows total copies to equal active loans and ignores returned loans', function () {
        $book = Book::factory()->create(['total_copies' => 3]);

        Loan::factory()
            ->count(2)
            ->for($book, 'book')
            ->create(['returned_at' => null]);

        Loan::factory()
            ->for($book, 'book')
            ->create(['returned_at' => now()->subDay()]);

        $updatedBook = app(UpdateBookAction::class)->execute(
            book: $book,
            attributes: validBookActionAttributes($book, [
                'total_copies' => 2,
            ]),
        );

        expect($updatedBook->total_copies)->toBe(2);
    });
});

describe('delete book', function () {
    it('rejects archiving a book with an active loan', function () {
        $book = Book::factory()->create();

        Loan::factory()
            ->for($book, 'book')
            ->create(['returned_at' => null]);

        expect(fn () => app(DeleteBookAction::class)->execute($book))
            ->toThrow(ValidationException::class);

        $this->assertModelExists($book);
        expect($book->fresh()->deleted_at)->toBeNull();
    });

    it('archives a book when all of its loans have been returned', function () {
        $book = Book::factory()->create();

        Loan::factory()
            ->for($book, 'book')
            ->create(['returned_at' => now()->subDay()]);

        app(DeleteBookAction::class)->execute($book);

        $this->assertSoftDeleted($book);
    });
});
