<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoanReportResource extends JsonResource
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
            'member' => [
                'member_number' => $this->member->member_number,
                'name' => $this->member->user->name,
            ],
            'book' => [
                'title' => $this->book->title,
                'isbn' => $this->book->isbn,
            ],
            'issued_at' => $this->issued_at?->toIso8601String(),
            'due_at' => $this->due_at?->toIso8601String(),
            'overdue_days' => (int) $this->due_at->diffInDays(now()),
        ];
    }
}
