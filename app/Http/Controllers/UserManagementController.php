<?php

namespace App\Http\Controllers;

use App\Domain\User\Actions\UpdateUserRoleAction;
use App\Domain\User\Enums\UserRole;
use App\Domain\User\Models\User;
use App\Domain\User\Queries\UserQuery;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request, UserQuery $query): Response
    {
        Gate::authorize('viewAny', User::class);

        $search = (string) $request->string('search')->trim();
        $role = UserRole::tryFrom((string) $request->string('role'));

        return Inertia::render('Admin/Dashboard', [
            'users' => UserResource::collection(
                $query->getUserList($search, $role)
            ),
            'filters' => [
                'search' => $search,
                'role' => $role?->value ?? '',
            ],
            'roles' => UserRole::options(),
        ]);
    }

    public function updateRole(
        UpdateUserRoleRequest $request,
        User $user,
        UpdateUserRoleAction $action,
    ): JsonResponse {
        Gate::authorize('updateRole', $user);

        $user = $action->execute(
            $user,
            UserRole::from((string) $request->validated('role')),
        );

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => UserResource::make($user),
        ]);
    }
}
