<?php

namespace App\Http\Controllers;

use App\Domain\Loan\Actions\IssueLoanAction;
use App\Domain\Loan\Actions\RequestLoanReturnAction;
use App\Domain\Loan\Actions\ReturnLoanAction;
use App\Domain\Loan\Models\Loan;
use App\Domain\Loan\Queries\LoanQuery;
use App\Http\Requests\IssueLoanRequest;
use App\Http\Requests\LoanIndexRequest;
use App\Http\Resources\LoanResource;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(LoanIndexRequest $request, LoanQuery $loanQuery): Response
    {
        Gate::authorize('viewAny', Loan::class);

        return Inertia::render('Staff/Loans/Index', [
            'loans' => fn () => LoanResource::collection(
                $loanQuery->paginate(
                    search: $request->search(),
                    status: $request->status(),
                    perPage: $request->perPage(),
                    sort: $request->sort(),
                    direction: $request->direction(),
                ),
            ),
            'filters' => $request->filters(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        Gate::authorize('create', Loan::class);

        return Inertia::render('Staff/Loans/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(IssueLoanRequest $request, IssueLoanAction $action): JsonResponse
    {
        Gate::authorize('create', Loan::class);

        $attributes = $request->validated();
        $attributes['due_at'] = CarbonImmutable::parse(
            $attributes['due_at'],
        )->endOfDay();

        $loan = $action->execute(
            attributes: $attributes,
            issuedBy: $request->user(),
        );

        $loan->load(['member.user', 'book', 'issuedBy', 'returnedBy']);

        return response()->json([
            'message' => 'Loan created successfully',
            'loan' => LoanResource::make($loan)->resolve($request),
        ], 201);
    }

    public function returnLoan(Loan $loan, Request $request, ReturnLoanAction $action): JsonResponse
    {
        Gate::authorize('returnLoan', $loan);

        $returnedLoan = $action->execute(
            loan: $loan,
            returnedBy: $request->user(),
        );

        $returnedLoan->load(['member.user', 'book', 'issuedBy', 'returnedBy']);

        return response()->json([
            'message' => 'Book received and loan completed.',
            'loan' => LoanResource::make($returnedLoan)->resolve($request),
        ]);
    }

    public function requestReturn(Loan $loan, Request $request, RequestLoanReturnAction $action): JsonResponse
    {
        Gate::authorize('requestReturn', $loan);

        $requestedLoan = $action->execute($loan);

        $requestedLoan->load(['member.user', 'book', 'issuedBy', 'returnedBy']);

        return response()->json([
            'message' => 'Return request submitted. Staff must confirm the book was received.',
            'loan' => LoanResource::make($requestedLoan)->resolve($request),
        ]);
    }
}
