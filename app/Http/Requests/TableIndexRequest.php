<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class TableIndexRequest extends FormRequest
{
    /**
     * @var list<int>
     */
    public const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

    public const DEFAULT_PAGE_SIZE = 10;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return list<string>
     */
    abstract protected function allowedSorts(): array;

    abstract protected function defaultSort(): string;

    protected function prepareForValidation(): void
    {
        $requestedPageSize = $this->integer('per_page');
        $requestedSort = (string) $this->string('sort');
        $requestedDirection = (string) $this->string('direction');

        $this->merge([
            'search' => (string) $this->string('search')->trim(),
            'per_page' => in_array(
                $requestedPageSize,
                self::PAGE_SIZE_OPTIONS,
                true,
            ) ? $requestedPageSize : self::DEFAULT_PAGE_SIZE,
            'sort' => in_array(
                $requestedSort,
                $this->allowedSorts(),
                true,
            ) ? $requestedSort : $this->defaultSort(),
            'direction' => in_array(
                $requestedDirection,
                ['asc', 'desc'],
                true,
            ) ? $requestedDirection : 'desc',
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => [
                'required',
                'integer',
                Rule::in(self::PAGE_SIZE_OPTIONS),
            ],
            'sort' => [
                'required',
                'string',
                Rule::in($this->allowedSorts()),
            ],
            'direction' => [
                'required',
                'string',
                Rule::in(['asc', 'desc']),
            ],
        ];
    }

    public function search(): string
    {
        return (string) $this->validated('search', '');
    }

    public function perPage(): int
    {
        return (int) $this->validated('per_page');
    }

    public function sort(): string
    {
        return (string) $this->validated('sort');
    }

    public function direction(): string
    {
        return (string) $this->validated('direction');
    }

    /**
     * @return array{
     *      search: string,
     *      per_page: int,
     *      sort: string,
     *      direction: string
     * }
     */
    public function filters(): array
    {
        return [
            'search' => $this->search(),
            'per_page' => $this->perPage(),
            'sort' => $this->sort(),
            'direction' => $this->direction(),
        ];
    }
}
