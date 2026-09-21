<?php

namespace App\Domain\Community\Actions;

use App\Domain\Community\Models\CommunityPost;
use App\Domain\User\Models\User;
use Illuminate\Support\Facades\DB;

class ToggleCommunityPostLikeAction
{
    /**
     * @return array{liked: bool, likes_count: int}
     */
    public function execute(CommunityPost $post, User $user): array
    {
        return DB::transaction(function () use ($post, $user): array {
            $lockedPost = CommunityPost::query()
                ->lockForUpdate()
                ->findOrFail($post->getKey());

            $like = $lockedPost->likes()
                ->where('user_id', $user->id)
                ->first();

            if ($like) {
                $like->deleteOrFail();

                return [
                    'liked' => false,
                    'likes_count' => $lockedPost->likes()->count(),
                ];
            }

            $lockedPost->likes()->create([
                'user_id' => $user->id,
            ]);

            return [
                'liked' => true,
                'likes_count' => $lockedPost->likes()->count(),
            ];
        });
    }
}
