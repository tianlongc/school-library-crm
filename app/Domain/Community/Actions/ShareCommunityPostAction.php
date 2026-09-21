<?php

namespace App\Domain\Community\Actions;

use App\Domain\Community\Models\CommunityPost;

class ShareCommunityPostAction
{
    public function execute(CommunityPost $post): int
    {
        $post->increment('shares_count');

        return (int) $post->refresh()->shares_count;
    }
}
