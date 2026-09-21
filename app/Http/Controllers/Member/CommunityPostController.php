<?php

namespace App\Http\Controllers\Member;

use App\Domain\Book\Models\Book;
use App\Domain\Book\Queries\BookOptionQuery;
use App\Domain\Community\Actions\CreateCommunityPostAction;
use App\Domain\Community\Actions\DeleteCommunityPostAction;
use App\Domain\Community\Actions\UpdateCommunityPostAction;
use App\Domain\Community\Models\CommunityPost;
use App\Domain\Community\Queries\CommunityFeedQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\Community\CommunityFeedRequest;
use App\Http\Requests\Community\StoreCommunityPostRequest;
use App\Http\Requests\Community\UpdateCommunityPostRequest;
use App\Http\Resources\CommunityPostResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CommunityPostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(CommunityFeedQuery $feedQuery, BookOptionQuery $bookOptionQuery): Response
    {
        $books = $bookOptionQuery->get();

        return Inertia::render(
            'Member/Community/Index',
            [
                'initialPosts' => CommunityPostResource::collection(
                    $feedQuery->paginate(),
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
            $feedQuery->paginate(
                page: $validated['page'],
                perPage: $validated['per_page'],
            ),
        );
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

        $post = $action->execute(
            post: $post,
            attributes: $request->validated(),
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
