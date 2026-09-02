<?php

namespace App\Http\Requests;

use App\Domain\User\Enums\UserRole;
use Illuminate\Validation\Rule;

class UserIndexRequest extends TableIndexRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'role' => UserRole::tryFrom(
                (string) $this->string('role'),
            )?->value ?? '',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'role' => ['nullable', Rule::enum(UserRole::class)],
        ];
    }

    public function role(): ?UserRole
    {
        return UserRole::tryFrom(
            (string) $this->validated('role', ''),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        return [
            ...parent::filters(),
            'role' => $this->role()?->value ?? '',
        ];
    }

    /**
     * @return list<string>
     */
    protected function allowedSorts(): array
    {
        return ['name', 'member_number', 'created_at'];
    }

    protected function defaultSort(): string
    {
        return 'created_at';
    }
}
