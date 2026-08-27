<?php

namespace App\Http\Controllers;

use App\Domain\Member\Actions\DeactivateMemberAction;
use App\Domain\Member\Actions\ReactivateMemberAction;
use App\Domain\Member\Actions\SuspendMemberAction;
use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use App\Domain\Member\Queries\MemberQuery;
use App\Http\Resources\MemberResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(Request $request, MemberQuery $query): Response
    {
        Gate::authorize('viewAny', Member::class);

        $search = (string) $request->string('search')->trim();

        $status = MemberStatus::tryFrom(
            (string) $request->string('status')
        );

        return Inertia::render('Staff/Members/Index', [
            'members' => MemberResource::collection(
                $query->getMemberList($search, $status)
            ),
            'filters' => [
                'search' => $search,
                'status' => $status?->value ?? '',
            ],
            'statuses' => MemberStatus::options(),
            'can' => [
                'suspend' => $request->user()->can('members.suspend'),
                'deactivate' => $request->user()->can('members.deactivate'),
                'reactivate' => $request->user()->can('members.reactivate'),
            ],
        ]);
    }

    public function suspend(Member $member, SuspendMemberAction $action): JsonResponse
    {
        Gate::authorize('suspend', $member);

        $member = $action->execute($member);

        $member->load('user.roles');

        return response()->json([
            'message' => 'Member suspended successfully',
            'member' => MemberResource::make($member),
        ]);
    }

    public function deactivate(Member $member, DeactivateMemberAction $action): JsonResponse
    {
        Gate::authorize('deactivate', $member);

        $member = $action->execute($member);

        $member->load('user.roles');

        return response()->json([
            'message' => 'Member deactivated successfully',
            'member' => MemberResource::make($member),
        ]);
    }

    public function reactivate(Member $member, ReactivateMemberAction $action): JsonResponse
    {
        Gate::authorize('reactivate', $member);

        $member = $action->execute($member);

        $member->load('user.roles');

        return response()->json([
            'message' => 'Member reactivated successfully',
            'member' => MemberResource::make($member),
        ]);
    }
}
