<?php

namespace App\Http\Requests\Book;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBookRequest extends FormRequest
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
        $book = $this->route('book');

        return [
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'description' => 'nullable|string',
            'isbn' => 'required|string|size:13|unique:books,isbn,'.$book->getKey().',id',
            'total_copies' => 'required|integer|min:1',
            'category_id' => 'nullable|integer|exists:categories,id',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ];
    }
}
