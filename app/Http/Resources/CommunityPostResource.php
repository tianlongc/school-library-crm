<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class CommunityPostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'status' => $this->status->value,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'author' => [
                'id' => $this->author->id,
                'name' => $this->author->name,
            ],
            'book' => $this->whenLoaded(
                'book',
                fn () => $this->book
                    ? [
                        'id' => $this->book->id,
                        'title' => $this->book->title,
                        'author' => $this->book->author,
                        'isbn' => $this->book->isbn,
                    ]
                    : null,
            ),
            'images' => $this->whenLoaded(
                'media',
                fn () => $this->getMedia('images')
                    ->map(fn (Media $media): array => [
                        'uuid' => $media->uuid,
                        'url' => $media->getUrl(),
                    ])
                    ->values()
                    ->all(),
                [],
            ),

            'comments_count' => (int) ($this->comments_count ?? 0),
            'likes_count' => (int) ($this->likes_count ?? 0),
            'shares_count' => (int) ($this->shares_count ?? 0),
            'liked_by_me' => (bool) ($this->liked_by_me ?? false),

            'can' => [
                'update' => $request->user()
                    ?->can('update', $this->resource)
                    ?? false,

                'delete' => $request->user()
                    ?->can('delete', $this->resource)
                    ?? false,

                'comment' => $request->user()
                    ?->can('comment', $this->resource)
                    ?? false,
            ],
        ];
    }
}
