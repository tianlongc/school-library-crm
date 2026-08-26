<?php

namespace App\Domain\Category\Actions;

use App\Domain\Category\Models\Category;
use Illuminate\Support\Facades\DB;

class CreateCategoryAction
{
    /**
     * @param array{
     *      name: string,
     * } $attributes
     */
    public function execute(array $attributes): Category
    {
        return DB::transaction(function () use ($attributes): Category {
            $category = Category::create([
                'name' => $attributes['name'],
            ]);

            return $category;
        });
    }
}
