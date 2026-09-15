<?php

namespace Database\Seeders;

use App\Domain\Cms\CmsPageDocument;
use App\Domain\Cms\Models\CmsPage;
use Illuminate\Database\Seeder;

class CmsPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $content = CmsPageDocument::defaultContent();

        CmsPage::query()->firstOrCreate(
            ['key' => CmsPageDocument::StudentPortalHomepage],
            [
                'title' => 'Student portal homepage',
                'draft_content' => $content,
                'published_content' => $content,
                'published_at' => now(),
            ],
        );
    }
}
