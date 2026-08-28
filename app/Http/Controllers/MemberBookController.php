<?php

namespace App\Http\Controllers;

use App\Domain\Book\Models\Book;
use App\Domain\Book\Queries\BookQuery;
use App\Domain\Loan\Actions\BorrowBookAction;
use App\Domain\Loan\Models\Loan;
use App\Domain\Member\Models\Member;
use App\Http\Resources\BookResource;
use App\Http\Resources\LoanResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MemberBookController extends Controller
{
    public function index(Request $request, BookQuery $bookQuery): Response
    {
        $member = $request->user()->member()->with(['user.roles'])->first();

        abort_if($member === null, 403);

        Gate::authorize('browseCatalogue', $member);

        $search = (string) $request->string('search')->trim();

        return Inertia::render('Member/Books/Index', [
            'books' => BookResource::collection(
                $bookQuery->getMemberCatalog(
                    member: $member,
                    search: $search,
                ),
            ),
            'filters' => [
                'search' => $search,
            ],
            'borrowingEligibility' => $this->borrowingEligibility($member),
        ]);
    }

    public function borrow(Book $book, Request $request, BorrowBookAction $action): JsonResponse
    {
        Gate::authorize('borrow', Loan::class);

        $loan = $action->execute(
            book: $book,
            borrower: $request->user(),
        );

        $loan->load(['member.user', 'book', 'issuedBy', 'returnedBy']);

        return response()->json([
            'message' => 'Book borrowed successfully.',
            'loan' => LoanResource::make($loan)->resolve($request),
        ], 201);
    }

    /**
     * @return array{eligible: bool, message: string|null}
     */
    private function borrowingEligibility(Member $member): array
    {
        if (! $member->status->canBorrow()) {
            return [
                'eligible' => false,
                'message' => sprintf(
                    'Your membership is currently %s. Contact library staff before borrowing.',
                    strtolower($member->status->label()),
                ),
            ];
        }

        if ($member->hasOverdueLoans()) {
            return [
                'eligible' => false,
                'message' => 'Return your overdue books before borrowing another book.',
            ];
        }

        return [
            'eligible' => true,
            'message' => null,
        ];
    }
}
