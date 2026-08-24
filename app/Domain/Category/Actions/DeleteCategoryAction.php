<?php

namespace App\Domain\Category\Actions;

use App\Domain\Category\Models\Category;

class DeleteCategoryAction
{
    public function execute(Category $category): void
    {
        $category->deleteOrFail();
    }
}
