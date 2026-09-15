<?php

namespace App\Domain\Cms;

class CmsPageDocument
{
    public const int SchemaVersion = 1;

    public const string StudentPortalHomepage = 'student_portal_homepage';

    /**
     * @var list<string>
     */
    public const array BlockTypes = [
        'hero',
        'announcement',
        'book_collection',
        'rich_text',
        'call_to_action',
    ];

    /**
     * @return array{schema_version: int, blocks: list<array<string, mixed>>}
     */
    public static function defaultContent(): array
    {
        return [
            'schema_version' => self::SchemaVersion,
            'blocks' => [
                [
                    'id' => 'library-announcement',
                    'type' => 'announcement',
                    'is_visible' => true,
                    'data' => [
                        'heading' => 'Library announcement',
                        'body' => 'Welcome to the school library.',
                    ],
                ],
                [
                    'id' => 'featured-books',
                    'type' => 'book_collection',
                    'is_visible' => true,
                    'data' => [
                        'heading' => 'Featured books',
                        'body' => 'Books selected by the library team.',
                        'book_ids' => [],
                    ],
                ],
                [
                    'id' => 'currently-reading',
                    'type' => 'book_collection',
                    'is_visible' => true,
                    'data' => [
                        'heading' => 'Currently reading',
                        'body' => 'Popular choices from the student community.',
                        'book_ids' => [],
                    ],
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $content
     * @return list<int>
     */
    public static function visibleBookIds(array $content): array
    {
        return collect($content['blocks'] ?? [])
            ->filter(fn (mixed $block): bool => is_array($block)
                && ($block['type'] ?? null) === 'book_collection'
                && ($block['is_visible'] ?? false) === true)
            ->flatMap(fn (array $block): array => is_array($block['data']['book_ids'] ?? null)
                ? $block['data']['book_ids']
                : [])
            ->map(fn (mixed $bookId): int => (int) $bookId)
            ->filter(fn (int $bookId): bool => $bookId > 0)
            ->unique()
            ->values()
            ->all();
    }
}
