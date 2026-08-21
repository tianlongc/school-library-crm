<?php

use App\Domain\Book\Models\Book;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

function validBookData(array $overrides = []): array
{
    return array_merge([
        'title' => 'Clean Code',
        'author' => 'Robert C. Martin',
        'isbn' => '9780132350884',
        'description' => 'A handbook of agile software craftsmanship.',
        'total_copies' => 3,
    ], $overrides);
}

beforeEach(function () {
    $this->withoutVite();
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('redirects guests away from book management', function () {
    $this->get(route('staff.books.index'))
        ->assertRedirect(route('login'));
});

it('forbids users from the staff book workspace', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    $this->actingAs($user)
        ->get(route('staff.books.index'))
        ->assertForbidden();
});

it('allows admins to access the staff book workspace', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('staff.books.index'))
        ->assertSuccessful();
});

describe('authenticated book management', function () {
    beforeEach(function () {
        $librarian = User::factory()->create();
        $librarian->assignRole('librarian');

        $this->actingAs($librarian);
    });

    it('renders the book index', function () {
        Book::factory()->create();

        $this->get(route('staff.books.index'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Staff/Books/Index')
                ->has('books.data', 1)
                ->where('filters.search', '')
            );
    });

    it('returns twelve books per page', function () {
        Book::factory()->count(13)->create();

        $this->get(route('staff.books.index'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->has('books.data', 12)
                ->where('books.meta.current_page', 1)
                ->where('books.meta.per_page', 12)
                ->where('books.meta.total', 13)
            );
    });

    it('lists the newest books first', function () {
        $olderBook = Book::factory()->create([
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);
        $newerBook = Book::factory()->create([
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->get(route('staff.books.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('books.data.0.id', $newerBook->id)
                ->where('books.data.1.id', $olderBook->id)
            );
    });

    it('searches books by title, author, or isbn', function (
        string $field,
        string $fieldValue,
        string $search,
    ) {
        $matchingBook = Book::factory()->create([
            $field => $fieldValue,
            'isbn' => $field === 'isbn' ? $fieldValue : '9780000000001',
        ]);

        Book::factory()->create([
            'title' => 'An Unrelated Book',
            'author' => 'Another Writer',
            'isbn' => '9780000000002',
        ]);

        $this->get(route('staff.books.index', ['search' => $search]))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->has('books.data', 1)
                ->where('books.data.0.id', $matchingBook->id)
                ->where('filters.search', $search)
            );
    })->with([
        'title' => ['title', 'The Searchable Atlas', 'Searchable'],
        'author' => ['author', 'Distinctive Writer', 'Distinctive'],
        'isbn' => ['isbn', '9781234567890', '345678'],
    ]);

    it('preserves search parameters during pagination', function () {
        Book::factory()->count(13)->create([
            'author' => 'Indexable Writer',
        ]);

        $this->get(route('staff.books.index', ['search' => 'Indexable']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('books.links.next', fn (?string $url) => $url !== null && str_contains($url, 'search=Indexable')
                )
            );
    });

    it('renders the create page', function () {
        $this->get(route('staff.books.create'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Staff/Books/Create')
            );
    });

    it('renders the edit page', function () {
        $book = Book::factory()->create();

        $this->get(route('staff.books.edit', $book))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Staff/Books/Edit')
                ->where('book.id', $book->id)
                ->where('book.isbn', $book->isbn)
            );
    });

    it('creates a book from valid json', function () {
        $data = validBookData();

        $this->postJson(route('staff.books.store'), $data)
            ->assertCreated()
            ->assertJsonPath('message', 'Book created successfully')
            ->assertJsonPath('book.title', $data['title'])
            ->assertJsonPath('book.isbn', $data['isbn']);

        $this->assertDatabaseHas('books', [
            'title' => $data['title'],
            'author' => $data['author'],
            'isbn' => $data['isbn'],
            'total_copies' => $data['total_copies'],
        ]);
    });

    it('rejects missing required fields', function () {
        $this->postJson(route('staff.books.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'title',
                'author',
                'isbn',
                'total_copies',
            ]);
    });

    it('requires an isbn containing exactly thirteen characters', function (string $isbn) {
        $this->postJson(
            route('staff.books.store'),
            validBookData(['isbn' => $isbn]),
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('isbn');
    })->with([
        'twelve characters' => '123456789012',
        'fourteen characters' => '12345678901234',
    ]);

    it('rejects a duplicate isbn when creating a book', function () {
        $book = Book::factory()->create();

        $this->postJson(
            route('staff.books.store'),
            validBookData(['isbn' => $book->isbn]),
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('isbn');
    });

    it('allows a book to retain its isbn when updating', function () {
        $book = Book::factory()->create();
        $data = validBookData([
            'title' => 'Updated Book Title',
            'isbn' => $book->isbn,
        ]);

        $this->postJson(route('staff.books.update', $book), $data)
            ->assertSuccessful()
            ->assertJsonPath('book.id', $book->id)
            ->assertJsonPath('book.isbn', $book->isbn);

        expect($book->refresh()->title)->toBe('Updated Book Title');
    });

    it('rejects another books isbn when updating', function () {
        $book = Book::factory()->create();
        $otherBook = Book::factory()->create();

        $this->postJson(
            route('staff.books.update', $book),
            validBookData(['isbn' => $otherBook->isbn]),
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('isbn');
    });

    it('persists a valid book update', function () {
        $book = Book::factory()->create();
        $data = validBookData([
            'title' => 'Refactoring',
            'author' => 'Martin Fowler',
            'isbn' => '9780201485677',
            'total_copies' => 8,
        ]);

        $this->postJson(route('staff.books.update', $book), $data)
            ->assertSuccessful()
            ->assertJsonPath('book.title', 'Refactoring')
            ->assertJsonPath('book.total_copies', 8);

        $book->refresh();

        expect($book->title)->toBe('Refactoring')
            ->and($book->author)->toBe('Martin Fowler')
            ->and($book->isbn)->toBe('9780201485677')
            ->and($book->total_copies)->toBe(8);
    });

    it('shows the requested book', function () {
        $book = Book::factory()->create();

        $this->get(route('staff.books.show', $book))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Staff/Books/Show')
                ->where('book.id', $book->id)
                ->where('book.title', $book->title)
                ->where('book.author', $book->author)
                ->where('book.isbn', $book->isbn)
                ->where('book.total_copies', $book->total_copies)
            );
    });

    it('soft deletes a book', function () {
        $book = Book::factory()->create();

        $this->deleteJson(route('staff.books.destroy', $book))
            ->assertSuccessful();

        $this->assertSoftDeleted($book);
    });

    it('does not include soft deleted books in the index', function () {
        $activeBook = Book::factory()->create();
        $archivedBook = Book::factory()->create();
        $archivedBook->delete();

        $this->get(route('staff.books.index'))
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->has('books.data', 1)
                ->where('books.data.0.id', $activeBook->id)
            );
    });

    it('returns not found for an unknown book', function () {
        $this->get(route('staff.books.show', 999999))
            ->assertNotFound();
    });

    it('returns not found for an archived book', function () {
        $book = Book::factory()->create();
        $book->delete();

        $this->get(route('staff.books.show', $book->id))
            ->assertNotFound();
    });
});
