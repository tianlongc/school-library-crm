<?php

use App\Domain\Book\Models\Book;
use App\Domain\Category\Models\Category;

it('links books and categories through their Eloquent relationships', function () {
    $category = Category::factory()->create();
    $book = Book::factory()->create(['category_id' => $category->id]);

    expect($book->category->is($category))->toBeTrue()
        ->and($category->books()->sole()->is($book))->toBeTrue();
});
