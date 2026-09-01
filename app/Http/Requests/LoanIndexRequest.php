<?php

namespace App\Http\Requests;

use App\Domain\Loan\Enums\LoanStatus;
use Illuminate\Validation\Rule;

class LoanIndexRequest extends TableIndexRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'status' => LoanStatus::tryFrom(
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
            'status' => ['nullable', Rule::enum(LoanStatus::class)],
        ];
    }

    public function status(): ?LoanStatus
    {
        return LoanStatus::tryFrom(
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
        return [
            'member_name',
            'member_number',
            'book_title',
            'isbn',
            'issued_at',
            'due_at',
            'returned_at',
        ];
    }

    protected function defaultSort(): string
    {
        return 'issued_at';
    }
}
