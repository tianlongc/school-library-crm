<?php

namespace App\Http\Controllers\Member;

use App\Domain\Book\Models\Book;
use App\Domain\Book\Queries\BookOptionQuery;
use App\Domain\Community\Actions\CreateCommunityPostAction;
use App\Domain\Community\Actions\CreateCommunityPostCommentAction;
use App\Domain\Community\Actions\DeleteCommunityPostAction;
use App\Domain\Community\Actions\ShareCommunityPostAction;
use App\Domain\Community\Actions\ToggleCommunityPostLikeAction;
use App\Domain\Community\Actions\UpdateCommunityPostAction;
use App\Domain\Community\Models\CommunityPost;
use App\Domain\Community\Queries\CommunityFeedQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\Community\CommunityFeedRequest;
use App\Http\Requests\Community\StoreCommunityPostCommentRequest;
use App\Http\Requests\Community\StoreCommunityPostRequest;
use App\Http\Requests\Community\UpdateCommunityPostRequest;
use App\Http\Resources\CommunityPostCommentResource;
use App\Http\Resources\CommunityPostResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CommunityPostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, CommunityFeedQuery $feedQuery, BookOptionQuery $bookOptionQuery): Response
    {
        $books = $bookOptionQuery->get();

        return Inertia::render(
            'Member/Community/Index',
            [
                'initialPosts' => CommunityPostResource::collection(
                    $feedQuery->cursorPaginate(
                        viewer: $request->user(),
                    ),
                ),

                'bookOptions' => $books->map(
                    fn (Book $book) => [
                        'value' => $book->id,
                        'label' => "{$book->title} - {$book->author}",
                    ],
                ),
            ],
        );
    }

    public function feed(CommunityFeedRequest $request, CommunityFeedQuery $feedQuery): AnonymousResourceCollection
    {
        $validated = $request->validated();

        return CommunityPostResource::collection(
            $feedQuery->cursorPaginate(
                viewer: $request->user(),
                cursor: $validated['cursor'] ?? null,
                perPage: $validated['per_page'],
            ),
        );
    }

    public function comments(CommunityPost $post): AnonymousResourceCollection
    {
        Gate::authorize('interact', $post);

        return CommunityPostCommentResource::collection(
            $post->comments()
                ->with('author:id,name')
                ->latest()
                ->limit(20)
                ->get(),
        );
    }

    public function storeComment(StoreCommunityPostCommentRequest $request, CommunityPost $post, CreateCommunityPostCommentAction $action): JsonResponse
    {
        Gate::authorize('comment', $post);

        $comment = $action->execute(
            author: $request->user(),
            post: $post,
            body: $request->validated('body'),
        );

        return response()->json([
            'message' => 'Comment added successfully.',
            'comment' => CommunityPostCommentResource::make($comment)->resolve($request),
            'comments_count' => $post->comments()->count(),
        ], 201);
    }

    public function toggleLike(Request $request, CommunityPost $post, ToggleCommunityPostLikeAction $action): JsonResponse
    {
        Gate::authorize('interact', $post);

        $result = $action->execute(
            post: $post,
            user: $request->user(),
        );

        return response()->json([
            'message' => $result['liked']
                ? 'Post liked.'
                : 'Post unliked.',
            ...$result,
        ]);
    }

    public function share(CommunityPost $post, ShareCommunityPostAction $action): JsonResponse
    {
        Gate::authorize('interact', $post);

        return response()->json([
            'message' => 'Post shared successfully.',
            'shares_count' => $action->execute($post),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCommunityPostRequest $request, CreateCommunityPostAction $action): JsonResponse
    {
        $validated = $request->validated();
        $images = $validated['images'] ?? [];
        unset($validated['images']);

        $post = $action->execute(
            $request->user(),
            $validated,
            $images,
        );

        return response()->json([
            'message' => 'Post created successfully',
            'post' => CommunityPostResource::make($post)->resolve($request),
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CommunityPost $post, UpdateCommunityPostRequest $request, UpdateCommunityPostAction $action): JsonResponse
    {
        Gate::authorize('update', $post);

        $validated = $request->validated();
        $images = $validated['images'] ?? [];
        $removeImageUuids = $validated['remove_image_uuids'] ?? [];
        unset($validated['images'], $validated['remove_image_uuids']);

        $post = $action->execute(
            post: $post,
            attributes: $validated,
            images: $images,
            removeImageUuids: $removeImageUuids,
        );

        $post->loadCount([
            'comments',
            'likes',
        ]);
        $post->setAttribute(
            'liked_by_me',
            $post->likes()
                ->where('user_id', $request->user()->id)
                ->exists(),
        );

        return response()->json([
            'message' => 'Post updated successfully',
            'post' => CommunityPostResource::make($post)->resolve($request),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CommunityPost $post, DeleteCommunityPostAction $action): JsonResponse
    {
        Gate::authorize('delete', $post);

        $action->execute(
            post: $post,
        );

        return response()->json([
            'message' => 'Post deleted successfully',
        ]);
    }
}
