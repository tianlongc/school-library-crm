<?php

namespace App\Http\Requests\Cms;

use App\Domain\Cms\Documents\CmsPageDocument;
use App\Domain\Cms\Models\CmsPage;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCmsPageContentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $content = $this->input('content');

        if (! is_array($content) || ! is_array($content['blocks'] ?? null)) {
            return;
        }

        $content['blocks'] = collect($content['blocks'])->map(function (mixed $block): mixed {
            if (is_array($block) && is_array($block['data'] ?? null)) {
                unset($block['data']['media_url']);
            }

            return $block;
        })->all();

        $this->merge(['content' => $content]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => ['required', 'array:schema_version,blocks'],
            'content.schema_version' => ['required', 'integer', 'in:'.CmsPageDocument::SchemaVersion],
            'content.blocks' => ['present', 'array', 'list', 'max:30'],
            'content.blocks.*' => ['required', 'array:id,type,is_visible,data'],
            'content.blocks.*.id' => ['required', 'string', 'max:100', 'distinct:strict'],
            'content.blocks.*.type' => ['required', 'string', Rule::in(CmsPageDocument::BlockTypes)],
            'content.blocks.*.is_visible' => ['required', 'boolean'],
            'content.blocks.*.data' => ['required', 'array:eyebrow,heading,body,label,target,book_ids,media_uuid,alt'],
            'content.blocks.*.data.eyebrow' => ['nullable', 'string', 'max:80'],
            'content.blocks.*.data.heading' => ['nullable', 'string', 'max:255'],
            'content.blocks.*.data.body' => ['nullable', 'string', 'max:3000'],
            'content.blocks.*.data.label' => ['nullable', 'string', 'max:80'],
            'content.blocks.*.data.target' => ['nullable', 'string', Rule::in(['catalogue', 'account'])],
            'content.blocks.*.data.book_ids' => ['nullable', 'array', 'list', 'max:12'],
            'content.blocks.*.data.book_ids.*' => ['required', 'integer', 'distinct', 'exists:books,id'],
            'content.blocks.*.data.media_uuid' => ['nullable', 'string', 'uuid'],
            'content.blocks.*.data.alt' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $page = CmsPage::query()
                    ->where('key', CmsPageDocument::StudentPortalHomepage)
                    ->first();

                if ($page === null) {
                    return;
                }

                $ownedUuids = $page->getMedia('builder_images')->pluck('uuid');

                foreach ($this->input('content.blocks', []) as $index => $block) {
                    $uuid = is_array($block) ? ($block['data']['media_uuid'] ?? null) : null;

                    if (is_string($uuid) && $uuid !== '' && ! $ownedUuids->contains($uuid)) {
                        $validator->errors()->add(
                            "content.blocks.{$index}.data.media_uuid",
                            'The selected image does not belong to this page.',
                        );
                    }
                }
            },
        ];
    }
}
