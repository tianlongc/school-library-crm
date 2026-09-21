<?php

namespace App\Domain\Community\Actions;

use App\Domain\Community\Enums\CommunityPostStatus;
use App\Domain\Community\Models\CommunityPost;
use App\Domain\User\Models\User;
use Illuminate\Http\UploadedFile;
use Throwable;

class CreateCommunityPostAction
{
    /**
     * @param array{
     *      body: string,
     *      book_id: ?int,
     * } $attributes
     * @param  list<UploadedFile>  $images
     */
    public function execute(User $author, array $attributes, array $images = []): CommunityPost
    {
        $post = CommunityPost::create([
            'user_id' => $author->id,
            'book_id' => $attributes['book_id'] ?? null,
            'body' => $attributes['body'],
            'status' => CommunityPostStatus::Published,
        ]);

        try {
            foreach ($images as $image) {
                $post->addMedia($image)->toMediaCollection('images');
            }
        } catch (Throwable $exception) {
            $post->clearMediaCollection('images');
            $post->forceDelete();

            throw $exception;
        }

        return $post->load([
            'author:id,name',
            'book:id,title,author,isbn',
            'media',
        ]);
    }
}
