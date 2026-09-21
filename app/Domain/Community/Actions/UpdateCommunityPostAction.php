<?php

namespace App\Domain\Community\Actions;

use App\Domain\Community\Models\CommunityPost;

class UpdateCommunityPostAction
{
    /**
     * @param array{
     *      body: string,
     *      book_id: ?int
     * } $attributes
     */
    public function execute(CommunityPost $post, array $attributes): CommunityPost
    {
        $post->updateOrFail([
            'body' => $attributes['body'],
            'book_id' => $attributes['book_id'] ?? null,
        ]);

        return $post->refresh()->load([
            'author:id,name',
            'book:id,title,author,isbn',
            'media',
        ]);
    }
}
