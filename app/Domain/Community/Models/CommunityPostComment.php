<?php

namespace App\Domain\Community\Models;

use App\Domain\User\Models\User;
use Database\Factories\CommunityPostCommentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['community_post_id', 'user_id', 'body'])]
#[UseFactory(CommunityPostCommentFactory::class)]
class CommunityPostComment extends Model
{
    use HasFactory;

    public function post(): BelongsTo
    {
        return $this->belongsTo(CommunityPost::class, 'community_post_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
