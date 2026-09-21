<?php

namespace App\Http\Controllers\Member;

use App\Domain\Book\Queries\BookQuery;
use App\Domain\Cms\Documents\CmsPageDocument;
use App\Domain\Cms\Queries\CmsPageQuery;
use App\Http\Controllers\Controller;
use App\Http\Resources\BookResource;
use App\Http\Resources\LoanResource;
use App\Http\Resources\MemberResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MemberDashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        CmsPageQuery $cmsPageQuery,
        BookQuery $bookQuery,
    ): Response {
        $member = $request->user()->member()->with(['user.roles'])->first();

        abort_if($member === null, 403);

        Gate::authorize('viewDashboard', $member);

        $currentLoans = $member->loans()
            ->with(['member.user', 'book', 'issuedBy', 'returnedBy'])
            ->whereNull('returned_at')
            ->orderBy('due_at')
            ->get();

        $cmsPage = $cmsPageQuery->getStudentPortalHomepage();
        $cmsContent = CmsPageDocument::withMediaUrls($cmsPage, $cmsPage->published_content);
        $homepageBooks = $bookQuery->getCmsBooks(
            CmsPageDocument::visibleBookIds($cmsContent),
        );

        return Inertia::render('Member/Dashboard', [
            'member' => MemberResource::make($member)->resolve($request),
            'currentLoans' => LoanResource::collection($currentLoans)->resolve($request),
            'cmsContent' => $cmsContent,
            'homepageBooks' => BookResource::collection($homepageBooks)->resolve($request),
        ]);
    }
}
