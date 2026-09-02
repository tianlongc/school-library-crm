<?php

namespace App\Http\Requests;

use App\Domain\Member\Enums\MemberStatus;
use Illuminate\Validation\Rule;

class MemberIndexRequest extends TableIndexRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'status' => MemberStatus::tryFrom(
                (string) $this->string('status'),
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
            'status' => ['nullable', Rule::enum(MemberStatus::class)],
        ];
    }

    public function status(): ?MemberStatus
    {
        return MemberStatus::tryFrom(
            (string) $this->validated('status', ''),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        return [
            ...parent::filters(),
            'status' => $this->status()?->value ?? '',
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
