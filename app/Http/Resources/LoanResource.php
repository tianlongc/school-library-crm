<?php

namespace App\Http\Resources;

use App\Domain\Loan\Enums\LoanStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoanResource extends JsonResource
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
                'id' => $this->member->id,
                'member_number' => $this->member->member_number,
                'name' => $this->member->user->name,
            ],
            'book' => [
                'id' => $this->book->id,
                'title' => $this->book->title,
                'isbn' => $this->book->isbn,
            ],
            'issued_at' => $this->issued_at?->toIso8601String(),
            'due_at' => $this->due_at?->toIso8601String(),
            'returned_at' => $this->returned_at?->toIso8601String(),
            'status' => LoanStatus::fromLoan($this->resource)->value,
            'issued_by' => $this->issuedBy?->name,
            'returned_by' => $this->returnedBy?->name,
        ];
    }
}
