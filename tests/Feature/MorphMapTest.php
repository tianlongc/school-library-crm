<?php

use App\Domain\Book\Models\Book;
use App\Domain\Cms\Models\CmsPage;

it('defines morph aliases for media-owning models', function () {
    expect((new Book)->getMorphClass())->toBe('book')
        ->and((new CmsPage)->getMorphClass())->toBe('cms_page');
});
