<?php

namespace App\Domain\Community\Actions;

use App\Domain\Community\Models\CommunityPost;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class UpdateCommunityPostAction
{
    /**
     * @param array{
     *      body: string,
     *      book_id: ?int,
     * } $attributes
     * @param  list<UploadedFile>  $images
     * @param  list<string>  $removeImageUuids
     */
    public function execute(
        CommunityPost $post,
        array $attributes,
        array $images = [],
        array $removeImageUuids = [],
    ): CommunityPost {
        $currentMedia = $post->getMedia('images');
        $currentMediaByUuid = $currentMedia->keyBy('uuid');
        $removeImageUuids = array_values(array_unique($removeImageUuids));
        $unknownImageUuids = array_values(array_diff(
            $removeImageUuids,
            $currentMediaByUuid->keys()->all(),
        ));

        if ($unknownImageUuids !== []) {
            throw ValidationException::withMessages([
                'remove_image_uuids' => 'One or more selected images do not belong to this post.',
            ]);
        }

        $finalImageCount = $currentMedia->count()
            - count($removeImageUuids)
            + count($images);

        if ($finalImageCount > 4) {
            throw ValidationException::withMessages([
                'images' => 'A post can contain no more than four images.',
            ]);
        }

        $addedMedia = [];

        try {
            DB::transaction(function () use (
                $post,
                $attributes,
                $images,
                $removeImageUuids,
                $currentMediaByUuid,
                &$addedMedia,
            ): void {
                $post->updateOrFail([
                    'body' => $attributes['body'],
                    'book_id' => $attributes['book_id'] ?? null,
                ]);

                foreach ($images as $image) {
                    $addedMedia[] = $post
                        ->addMedia($image)
                        ->toMediaCollection('images');
                }

                foreach ($removeImageUuids as $imageUuid) {
                    $currentMediaByUuid->get($imageUuid)?->delete();
                }
            });
        } catch (Throwable $exception) {
            foreach ($addedMedia as $media) {
                $media->delete();
            }

            throw $exception;
        }

        return $post->refresh()->load([
            'author:id,name',
            'book:id,title,author,isbn',
            'media',
        ]);
    }
}
