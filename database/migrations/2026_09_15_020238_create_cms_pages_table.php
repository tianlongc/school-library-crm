<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cms_pages', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('title');
            $table->json('draft_content');
            $table->json('published_content');
            $table->timestamp('published_at')->nullable();
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        if (! Schema::hasTable('cms_sections')) {
            return;
        }

        $legacySections = DB::table('cms_sections')
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        if ($legacySections->isNotEmpty()) {
            $blocks = $legacySections->map(function (object $section): array {
                $settings = json_decode((string) $section->settings, true);
                $settings = is_array($settings) ? $settings : [];
                $type = $section->key === 'announcement' ? 'announcement' : 'book_collection';

                return [
                    'id' => str_replace('_', '-', (string) $section->key),
                    'type' => $type,
                    'is_visible' => (bool) $section->is_visible,
                    'data' => array_filter([
                        'heading' => (string) $section->title,
                        'body' => $settings['body'] ?? null,
                        'book_ids' => $type === 'book_collection'
                            ? array_values($settings['book_ids'] ?? [])
                            : null,
                    ], fn (mixed $value): bool => $value !== null),
                ];
            })->values()->all();
            $content = json_encode([
                'schema_version' => 1,
                'blocks' => $blocks,
            ], JSON_THROW_ON_ERROR);
            $updatedByUserId = $legacySections
                ->pluck('updated_by_user_id')
                ->filter()
                ->last();

            DB::table('cms_pages')->insert([
                'key' => 'student_portal_homepage',
                'title' => 'Student portal homepage',
                'draft_content' => $content,
                'published_content' => $content,
                'published_at' => now(),
                'updated_by_user_id' => $updatedByUserId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $content = json_encode([
                'schema_version' => 1,
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
            ], JSON_THROW_ON_ERROR);

            DB::table('cms_pages')->insert([
                'key' => 'student_portal_homepage',
                'title' => 'Student portal homepage',
                'draft_content' => $content,
                'published_content' => $content,
                'published_at' => now(),
                'updated_by_user_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::drop('cms_sections');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('cms_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('title');
            $table->json('settings');
            $table->unsignedInteger('position');
            $table->boolean('is_visible')->default(true);
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_visible', 'position']);
        });

        $cmsPage = DB::table('cms_pages')
            ->where('key', 'student_portal_homepage')
            ->first();

        if ($cmsPage !== null) {
            $content = json_decode((string) $cmsPage->published_content, true);
            $blocks = is_array($content['blocks'] ?? null) ? $content['blocks'] : [];

            foreach ($blocks as $position => $block) {
                if (! is_array($block)) {
                    continue;
                }

                $data = is_array($block['data'] ?? null) ? $block['data'] : [];
                $blockId = (string) ($block['id'] ?? 'content-'.($position + 1));
                $key = match ($blockId) {
                    'library-announcement', 'announcement' => 'announcement',
                    'featured-books' => 'featured_books',
                    'currently-reading' => 'currently_reading',
                    default => 'content_'.($position + 1),
                };

                DB::table('cms_sections')->insert([
                    'key' => $key,
                    'title' => (string) ($data['heading'] ?? 'Homepage content'),
                    'settings' => json_encode(array_filter([
                        'body' => $data['body'] ?? null,
                        'book_ids' => $data['book_ids'] ?? null,
                    ], fn (mixed $value): bool => $value !== null), JSON_THROW_ON_ERROR),
                    'position' => $position + 1,
                    'is_visible' => (bool) ($block['is_visible'] ?? true),
                    'updated_by_user_id' => $cmsPage->updated_by_user_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        Schema::dropIfExists('cms_pages');
    }
};
