<?php

namespace App\Http\Requests\Community;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCommunityPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => [
                'required',
                'string',
                'max:2000',
            ],
            'book_id' => [
                'nullable',
                'integer',
                Rule::exists('books', 'id')
                    ->whereNull('deleted_at'),
            ],
            'images' => [
                'nullable',
                'array',
                'max:4',
            ],
            'images.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'remove_image_uuids' => [
                'nullable',
                'array',
                'max:4',
            ],
            'remove_image_uuids.*' => [
                'required',
                'uuid',
            ],
        ];
    }
}
