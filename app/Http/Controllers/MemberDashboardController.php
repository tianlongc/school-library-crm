<?php

namespace App\Http\Controllers;

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
    public function __invoke(Request $request): Response
    {
        $member = $request->user()->member()->with(['user.roles'])->first();

        abort_if($member === null, 403);

        Gate::authorize('viewDashboard', $member);

        $currentLoans = $member->loans()
            ->with(['member.user', 'book', 'issuedBy', 'returnedBy'])
            ->whereNull('returned_at')
            ->orderBy('due_at')
            ->get();

        return Inertia::render('Member/Dashboard', [
            'member' => MemberResource::make($member)->resolve($request),
            'currentLoans' => LoanResource::collection($currentLoans)->resolve($request),
        ]);
    }
}
