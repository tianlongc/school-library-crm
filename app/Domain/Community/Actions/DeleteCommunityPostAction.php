<?php

namespace App\Domain\Community\Actions;

use App\Domain\Community\Models\CommunityPost;

class DeleteCommunityPostAction
{
    /**
     * Summary of execute
     */
    public function execute(CommunityPost $post): void
    {
        $post->clearMediaCollection('images');
        $post->deleteOrFail();
    }
}
