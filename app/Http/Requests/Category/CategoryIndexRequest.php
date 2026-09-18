<?php

namespace App\Http\Requests\Category;

use App\Http\Requests\Table\TableIndexRequest;

class CategoryIndexRequest extends TableIndexRequest
{
    /**
     * @return list<string>
     */
    protected function allowedSorts(): array
    {
        return ['name', 'created_at'];
    }

    protected function defaultSort(): string
    {
        return 'created_at';
    }
}
