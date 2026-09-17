<?php

namespace App\Domain\Cms\Actions;

use App\Domain\Cms\Documents\CmsPageDocument;
use App\Domain\Cms\Models\CmsPage;

class CleanupCmsPageMediaAction
{
    public function execute(CmsPage $cmsPage): void
    {
        $referencedUuids = collect([
            ...CmsPageDocument::mediaUuids($cmsPage->draft_content ?? []),
            ...CmsPageDocument::mediaUuids($cmsPage->published_content ?? []),
        ])->unique();

        $cmsPage->getMedia('builder_images')
            ->reject(fn ($media): bool => $referencedUuids->contains($media->uuid))
            ->each->delete();
    }
}
