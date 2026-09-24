<?php

namespace App\Http\Requests\Cms;

use App\Domain\Cms\Actions\SanitizeCmsRichTextAction;
use App\Domain\Cms\Documents\CmsPageDocument;
use App\Domain\Cms\Models\CmsPage;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCmsPageContentRequest extends FormRequest
{
    private const RichTextCapableBlockTypes = ['hero', 'announcement', 'rich_text'];

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

        $richTextSanitizer = app(SanitizeCmsRichTextAction::class);

        $content['blocks'] = collect($content['blocks'])->map(function (mixed $block) use ($richTextSanitizer): mixed {
            if (is_array($block) && is_array($block['data'] ?? null)) {
                unset($block['data']['media_url']);

                $body = $block['data']['body'] ?? null;
                $bodyFormat = $block['data']['body_format'] ?? 'text';

                if (
                    in_array($block['type'] ?? null, self::RichTextCapableBlockTypes, true)
                    && $bodyFormat === 'html'
                    && is_string($body)
                    && strlen($body) <= SanitizeCmsRichTextAction::MaxInputBytes
                ) {
                    $block['data']['body'] = $richTextSanitizer->execute($body);
                }
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
            'content.blocks.*.data' => ['required', 'array:eyebrow,heading,body,body_format,label,target,book_ids,media_uuid,alt'],
            'content.blocks.*.data.eyebrow' => ['nullable', 'string', 'max:80'],
            'content.blocks.*.data.heading' => ['nullable', 'string', 'max:255'],
            'content.blocks.*.data.body' => ['nullable', 'string', 'max:20000'],
            'content.blocks.*.data.body_format' => ['sometimes', 'string', Rule::in(['text', 'html'])],
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

                $draftContent = $page?->draft_content ?? [];
                $existingBlocks = collect($draftContent['blocks'] ?? [])
                    ->filter(fn (mixed $block): bool => is_array($block) && is_string($block['id'] ?? null))
                    ->keyBy('id');
                $ownedUuids = $page?->getMedia('builder_images')->pluck('uuid') ?? collect();
                $richTextSanitizer = app(SanitizeCmsRichTextAction::class);

                foreach ($this->input('content.blocks', []) as $index => $block) {
                    if (! is_array($block)) {
                        continue;
                    }

                    $data = is_array($block['data'] ?? null) ? $block['data'] : [];
                    $body = $data['body'] ?? null;
                    $supportsFormattedBody = in_array(
                        $block['type'] ?? null,
                        self::RichTextCapableBlockTypes,
                        true,
                    );
                    $bodyFormat = $data['body_format'] ?? 'text';

                    if (! $supportsFormattedBody && array_key_exists('body_format', $data)) {
                        $validator->errors()->add(
                            "content.blocks.{$index}.data.body_format",
                            'Formatted body content is only available for hero, announcement, and rich text blocks.',
                        );
                    }

                    if (
                        $supportsFormattedBody
                        && $bodyFormat === 'html'
                        && is_string($body)
                        && strlen($body) > SanitizeCmsRichTextAction::MaxInputBytes
                    ) {
                        $validator->errors()->add(
                            "content.blocks.{$index}.data.body",
                            'The rich text body is too large.',
                        );
                    }

                    if (! $supportsFormattedBody && is_string($body) && mb_strlen($body) > 3000) {
                        $validator->errors()->add(
                            "content.blocks.{$index}.data.body",
                            'The body may not be greater than 3000 characters.',
                        );
                    }

                    $bodyLength = is_string($body)
                        ? ($supportsFormattedBody && $bodyFormat === 'html'
                            ? $richTextSanitizer->characterCount($body)
                            : mb_strlen($body))
                        : 0;

                    if ($bodyLength > 500) {
                        $blockId = is_string($block['id'] ?? null) ? $block['id'] : null;
                        $existingBlock = $blockId === null ? null : $existingBlocks->get($blockId);
                        $existingData = is_array($existingBlock['data'] ?? null) ? $existingBlock['data'] : [];
                        $bodyIsUnchanged = is_array($existingBlock)
                            && ($existingBlock['type'] ?? null) === ($block['type'] ?? null)
                            && ($existingData['body'] ?? null) === $body
                            && ($existingData['body_format'] ?? 'text') === $bodyFormat;

                        if (! $bodyIsUnchanged) {
                            $validator->errors()->add(
                                "content.blocks.{$index}.data.body",
                                'The body may not be greater than 500 characters.',
                            );
                        }
                    }

                    $uuid = $data['media_uuid'] ?? null;

                    if ($page !== null && is_string($uuid) && $uuid !== '' && ! $ownedUuids->contains($uuid)) {
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
