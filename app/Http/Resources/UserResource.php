<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'email_verified' => $this->email_verified_at !== null,
            'roles' => $this->whenLoaded(
                'roles',
                fn () => $this->roles->pluck('name')->values(),
            ),
            'member' => $this->whenLoaded(
                'member',
                fn () => $this->member === null ? null : [
                    'member_number' => $this->member->member_number,
                    'status' => $this->member->status->value,
                ],
            ),
            'created_at' => $this->created_at?->toISOString(),
            'is_current_user' => $request->user()?->is($this->resource) ?? false,
            'can' => [
                'update_role' => $request->user()?->can('updateRole', $this->resource) ?? false,
            ],
        ];
    }
}
