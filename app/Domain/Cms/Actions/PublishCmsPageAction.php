<?php

namespace App\Domain\Cms\Actions;

use App\Domain\Cms\Models\CmsPage;
use App\Domain\User\Models\User;
use Illuminate\Support\Facades\DB;

class PublishCmsPageAction
{
    public function __construct(private readonly CleanupCmsPageMediaAction $cleanupMedia) {}

    public function execute(CmsPage $cmsPage, User $updatedBy): CmsPage
    {
        return DB::transaction(function () use ($cmsPage, $updatedBy): CmsPage {
            $lockedPage = CmsPage::query()
                ->lockForUpdate()
                ->findOrFail($cmsPage->id);

            $lockedPage->updateOrFail([
                'published_content' => $lockedPage->draft_content,
                'published_at' => now(),
                'updated_by_user_id' => $updatedBy->id,
            ]);

            $lockedPage->refresh();
            $this->cleanupMedia->execute($lockedPage);

            return $lockedPage;
        });
    }
}
