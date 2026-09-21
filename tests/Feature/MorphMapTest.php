<?php

use App\Domain\Book\Models\Book;
use App\Domain\Cms\Models\CmsPage;
use App\Domain\Community\Models\CommunityPost;

it('defines morph aliases for media-owning models', function () {
    expect((new Book)->getMorphClass())->toBe('book')
        ->and((new CmsPage)->getMorphClass())->toBe('cms_page')
        ->and((new CommunityPost)->getMorphClass())->toBe('community_post');
});
