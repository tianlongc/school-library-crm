<?php

namespace App\Domain\Cms\Queries;

use App\Domain\Cms\Documents\CmsPageDocument;
use App\Domain\Cms\Models\CmsPage;

class CmsPageQuery
{
    public function getStudentPortalHomepage(): CmsPage
    {
        return CmsPage::query()
            ->where('key', CmsPageDocument::StudentPortalHomepage)
            ->firstOrFail();
    }
}
