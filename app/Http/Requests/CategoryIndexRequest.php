<?php

namespace App\Http\Requests;

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
