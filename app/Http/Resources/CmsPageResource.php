<?php

namespace App\Http\Resources;

use App\Domain\Cms\Documents\CmsPageDocument;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CmsPageResource extends JsonResource
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
            'key' => $this->key,
            'title' => $this->title,
            'draft_content' => CmsPageDocument::withMediaUrls($this->resource, $this->draft_content),
            'published_content' => CmsPageDocument::withMediaUrls($this->resource, $this->published_content),
            'published_at' => $this->published_at?->toISOString(),
            'updated_by' => $this->whenLoaded(
                'updatedBy',
                fn (): array => [
                    'id' => $this->updatedBy->id,
                    'name' => $this->updatedBy->name,
                ],
            ),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
