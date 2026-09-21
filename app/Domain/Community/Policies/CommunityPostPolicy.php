<?php

namespace App\Domain\Community\Policies;

use App\Domain\Community\Enums\CommunityPostStatus;
use App\Domain\Community\Models\CommunityPost;
use App\Domain\User\Models\User;

class CommunityPostPolicy
{
    public function update(User $user, CommunityPost $post): bool
    {
        return $user->id === $post->user_id;
    }

    public function delete(User $user, CommunityPost $post): bool
    {
        return $user->id === $post->user_id
            || $user->can('community.posts.moderate');
    }

    public function hide(User $user, CommunityPost $post): bool
    {
        return $user->can('community.posts.moderate');
    }

    public function interact(User $user, CommunityPost $post): bool
    {
        return $post->status === CommunityPostStatus::Published;
    }

    public function comment(User $user, CommunityPost $post): bool
    {
        return $user->can('community.posts.comment')
            && $this->interact($user, $post);
    }
}
