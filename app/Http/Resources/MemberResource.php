<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
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
            'member_number' => $this->member_number,
            'status' => $this->status->value,
            'name' => $this->user->name,
            'email' => $this->user->email,
            'roles' => $this->user->roles->pluck('name')->values(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
