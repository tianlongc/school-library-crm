<?php

namespace App\Domain\Community\Actions;

use App\Domain\Community\Models\CommunityPost;
use App\Domain\Community\Models\CommunityPostComment;
use App\Domain\User\Models\User;

class CreateCommunityPostCommentAction
{
    public function execute(
        User $author,
        CommunityPost $post,
        string $body,
    ): CommunityPostComment {
        return $post->comments()->create([
            'user_id' => $author->id,
            'body' => $body,
        ])->load('author:id,name');
    }
}
