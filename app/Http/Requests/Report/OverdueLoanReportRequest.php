<?php

namespace App\Http\Requests\Report;

use App\Http\Requests\Table\TableIndexRequest;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Validation\ValidationRule;
use Override;

class OverdueLoanReportRequest extends TableIndexRequest
{
    #[Override]
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'from' => $this->filled('from')
                ? (string) $this->string('from')
                : null,
            'to' => $this->filled('to')
                ? (string) $this->string('to')
                : null,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'from' => [
                'nullable',
                'date',
                'before_or_equal:to',
            ],
            'to' => [
                'nullable',
                'date',
                'after_or_equal:from',
            ],
        ];
    }

    public function from(): ?CarbonImmutable
    {
        $value = $this->validated('from');

        return $value === null
            ? null
            : CarbonImmutable::parse((string) $value)->startOfDay();
    }

    public function to(): ?CarbonImmutable
    {
        $value = $this->validated('to');

        return $value === null
            ? null
            : CarbonImmutable::parse((string) $value)->endOfDay();
    }

    /**
     * @return array{
     *      search: string,
     *      page: int,
     *      per_page: int,
     *      sort: string,
     *      direction: string,
     *      from: ?string,
     *      to: ?string
     * }
     */
    #[Override]
    public function filters(): array
    {
        return [
            ...parent::filters(),
            'from' => $this->validated('from'),
            'to' => $this->validated('to'),
        ];
    }

    /**
     * @return list<string>
     */
    #[Override]
    protected function allowedSorts(): array
    {
        return [
            'member_name',
            'member_number',
            'book_title',
            'due_at',
        ];
    }

    #[Override]
    protected function defaultSort(): string
    {
        return 'due_at';
    }
}
