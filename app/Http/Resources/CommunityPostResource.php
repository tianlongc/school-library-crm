<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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

            'can' => [
                'delete' => $request->user()
                    ?->can('delete', $this->resource)
                    ?? false,
            ],
        ];
    }
}
