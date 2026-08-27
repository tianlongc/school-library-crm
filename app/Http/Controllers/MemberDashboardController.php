<?php

namespace App\Http\Controllers;

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

        return Inertia::render('Member/Dashboard', [
            'member' => MemberResource::make($member),
        ]);
    }
}
