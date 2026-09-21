<?php

namespace App\Domain\Cms\Actions;

use App\Domain\Cms\Models\CmsPage;
use App\Domain\User\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateCmsPageDraftAction
{
    public function __construct(private readonly CleanupCmsPageMediaAction $cleanupMedia) {}

    /**
     * @param  array<string, mixed>  $content
     */
    public function execute(CmsPage $cmsPage, array $content, User $updatedBy): CmsPage
    {
        return DB::transaction(function () use ($cmsPage, $content, $updatedBy): CmsPage {
            $lockedPage = CmsPage::query()
                ->lockForUpdate()
                ->findOrFail($cmsPage->id);

            $lockedPage->updateOrFail([
                'draft_content' => $content,
                'updated_by_user_id' => $updatedBy->id,
            ]);

            $lockedPage->refresh();
            $this->cleanupMedia->execute($lockedPage);

            return $lockedPage;
        });
    }
}
