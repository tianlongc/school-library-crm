<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $attributes = $this->resource->getAttributes();

        $hasAvailability = array_key_exists(
            'active_loans_count',
            $attributes
        );

        $hasMemberLoan = array_key_exists(
            'member_active_loans_count',
            $attributes
        );

        return [
            'id' => $this->id,
            'title' => $this->title,
            'author' => $this->author,
            'isbn' => $this->isbn,
            'description' => $this->description,
            'total_copies' => (int) $this->total_copies,
            'available_copies' => $this->when(
                $hasAvailability,
                fn (): int => max(0, (int) $this->total_copies - (int) $this->active_loans_count),
            ),
            'has_active_loan' => $this->when(
                $hasMemberLoan,
                fn (): bool => (int) $this->member_active_loans_count > 0,
            ),
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
