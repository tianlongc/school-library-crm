<?php

namespace App\Domain\Category\Actions;

use App\Domain\Category\Models\Category;

class UpdateCategoryAction
{
    /**
     * @param array{
     *      name: string,
     * } $attributes
     */
    public function execute(Category $category, array $attributes): Category
    {
        $category->updateOrFail([
            'name' => $attributes['name'],
        ]);

        return $category;
    }
}
