<?php

namespace Database\Factories;

use App\Domain\Cms\CmsPageDocument;
use App\Domain\Cms\Models\CmsPage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CmsPage>
 */
class CmsPageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $content = CmsPageDocument::defaultContent();

        return [
            'key' => CmsPageDocument::StudentPortalHomepage,
            'title' => 'Student portal homepage',
            'draft_content' => $content,
            'published_content' => $content,
            'published_at' => now(),
        ];
    }
}
