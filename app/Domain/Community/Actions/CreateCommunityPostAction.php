<?php

namespace App\Domain\Community\Actions;

use App\Domain\Community\Enums\CommunityPostStatus;
use App\Domain\Community\Models\CommunityPost;
use App\Domain\User\Models\User;

class CreateCommunityPostAction
{
    /**
     * @param array{
     *      body: string,
     *      book_id: ?int
     * } $attributes
     */
    public function execute(User $author, array $attributes): CommunityPost
    {
        $post = CommunityPost::create([
            'user_id' => $author->id,
            'book_id' => $attributes['book_id'] ?? null,
            'body' => $attributes['body'],
            'status' => CommunityPostStatus::Published,
        ]);

        return $post->load([
            'author:id,name',
            'book:id,title,author,isbn',
        ]);
    }
}
