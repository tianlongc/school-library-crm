<?php

namespace App\Http\Requests\Community;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Override;

class CommunityFeedRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    #[Override]
    protected function prepareForValidation(): void
    {
        $this->merge([
            'per_page' => $this->input('per_page', 10),
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
            'cursor' => [
                'nullable',
                'string',
                'max:2048',
            ],
            'per_page' => [
                'required',
                'integer',
                Rule::in([10, 20]),
            ],
            'category_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
            ],
        ];
    }
}
