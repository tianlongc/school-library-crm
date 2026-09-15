<?php

namespace App\Http\Requests;

use App\Domain\Cms\CmsPageDocument;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCmsPageContentRequest extends FormRequest
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
            'content' => ['required', 'array:schema_version,blocks'],
            'content.schema_version' => ['required', 'integer', 'in:'.CmsPageDocument::SchemaVersion],
            'content.blocks' => ['required', 'array', 'list', 'max:30'],
            'content.blocks.*' => ['required', 'array:id,type,is_visible,data'],
            'content.blocks.*.id' => ['required', 'string', 'max:100', 'distinct:strict'],
            'content.blocks.*.type' => ['required', 'string', Rule::in(CmsPageDocument::BlockTypes)],
            'content.blocks.*.is_visible' => ['required', 'boolean'],
            'content.blocks.*.data' => ['required', 'array:eyebrow,heading,body,label,target,book_ids'],
            'content.blocks.*.data.eyebrow' => ['nullable', 'string', 'max:80'],
            'content.blocks.*.data.heading' => ['nullable', 'string', 'max:255'],
            'content.blocks.*.data.body' => ['nullable', 'string', 'max:3000'],
            'content.blocks.*.data.label' => ['nullable', 'string', 'max:80'],
            'content.blocks.*.data.target' => ['nullable', 'string', Rule::in(['catalogue', 'account'])],
            'content.blocks.*.data.book_ids' => ['nullable', 'array', 'list', 'max:12'],
            'content.blocks.*.data.book_ids.*' => ['required', 'integer', 'distinct', 'exists:books,id'],
        ];
    }
}
