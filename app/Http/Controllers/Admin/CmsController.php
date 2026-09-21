<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Book\Queries\BookQuery;
use App\Domain\Cms\Actions\PublishCmsPageAction;
use App\Domain\Cms\Actions\UpdateCmsPageDraftAction;
use App\Domain\Cms\Documents\CmsPageDocument;
use App\Domain\Cms\Queries\CmsPageQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\UpdateCmsPageContentRequest;
use App\Http\Resources\BookResource;
use App\Http\Resources\CmsPageResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsController extends Controller
{
    public function index(CmsPageQuery $cmsPageQuery, BookQuery $bookQuery): Response
    {
        $page = $cmsPageQuery->getStudentPortalHomepage();

        return Inertia::render('Admin/Cms/Builder', [
            'page' => CmsPageResource::make($page->load('updatedBy'))->resolve(),
            'bookOptions' => $this->bookOptions($bookQuery),
        ]);
    }

    public function preview(CmsPageQuery $cmsPageQuery, BookQuery $bookQuery): Response
    {
        $page = $cmsPageQuery->getStudentPortalHomepage();
        $content = CmsPageDocument::withMediaUrls($page, $page->draft_content);

        return Inertia::render('Admin/Cms/Preview', [
            'page' => CmsPageResource::make($page)->resolve(),
            'content' => $content,
            'homepageBooks' => BookResource::collection(
                $bookQuery->getCmsBooks(CmsPageDocument::visibleBookIds($content)),
            )->resolve(),
            'isDraftPreview' => true,
        ]);
    }

    public function storeMedia(Request $request, CmsPageQuery $cmsPageQuery): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $media = $cmsPageQuery->getStudentPortalHomepage()
            ->addMedia($validated['image'])
            ->toMediaCollection('builder_images');

        return response()->json([
            'media' => [
                'uuid' => $media->uuid,
                'url' => $media->getUrl(),
            ],
        ], 201);
    }

    public function updateContent(
        UpdateCmsPageContentRequest $request,
        CmsPageQuery $cmsPageQuery,
        UpdateCmsPageDraftAction $updateCmsPageDraft,
    ): JsonResponse {
        $page = $updateCmsPageDraft->execute(
            cmsPage: $cmsPageQuery->getStudentPortalHomepage(),
            content: $request->validated('content'),
            updatedBy: $request->user(),
        );

        return response()->json([
            'message' => 'Draft saved.',
            'page' => CmsPageResource::make($page->load('updatedBy'))->resolve($request),
        ]);
    }

    public function publish(
        Request $request,
        CmsPageQuery $cmsPageQuery,
        PublishCmsPageAction $publishCmsPage,
    ): JsonResponse {
        $page = $publishCmsPage->execute(
            cmsPage: $cmsPageQuery->getStudentPortalHomepage(),
            updatedBy: $request->user(),
        );

        return response()->json([
            'message' => 'Student portal content published.',
            'page' => CmsPageResource::make($page->load('updatedBy'))->resolve($request),
        ]);
    }

    /**
     * @return list<array{value: int, label: string, id: int, title: string, author: string}>
     */
    private function bookOptions(BookQuery $bookQuery): array
    {
        return $bookQuery->getCmsOptions()
            ->map(fn ($book): array => [
                'value' => $book->id,
                'label' => "{$book->title} - {$book->author}",
                'id' => $book->id,
                'title' => $book->title,
                'author' => $book->author,
            ])
            ->values()
            ->all();
    }
}
