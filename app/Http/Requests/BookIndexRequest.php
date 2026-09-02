<?php

namespace App\Http\Requests;

class BookIndexRequest extends TableIndexRequest
{
    /**
     * @return list<string>
     */
    protected function allowedSorts(): array
    {
        return [
            'title',
            'author',
            'isbn',
            'created_at',
        ];
    }

    protected function defaultSort(): string
    {
        return 'created_at';
    }
}
