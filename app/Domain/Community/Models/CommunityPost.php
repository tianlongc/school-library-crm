<?php

namespace App\Domain\Community\Models;

use App\Domain\Book\Models\Book;
use App\Domain\Community\Enums\CommunityPostStatus;
use App\Domain\Community\Policies\CommunityPostPolicy;
use App\Domain\User\Models\User;
use Database\Factories\CommunityPostFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['user_id', 'book_id', 'body', 'status'])]
#[UseFactory(CommunityPostFactory::class)]
#[UsePolicy(CommunityPostPolicy::class)]
class CommunityPost extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => CommunityPostStatus::class,
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class)->withTrashed();
    }
}
