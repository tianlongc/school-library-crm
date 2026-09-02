<?php

namespace App\Http\Controllers;

use App\Domain\User\Actions\UpdateUserRoleAction;
use App\Domain\User\Enums\UserRole;
use App\Domain\User\Models\User;
use App\Domain\User\Queries\UserQuery;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Requests\UserIndexRequest;
use App\Http\Resources\UserResource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(UserIndexRequest $request, UserQuery $query): Response
    {
        Gate::authorize('viewAny', User::class);

        return Inertia::render('Admin/Dashboard', [
            'users' => fn () => UserResource::collection(
                $this->userList($request, $query)
            ),
            'filters' => $request->filters(),
            'roles' => UserRole::options(),
        ]);
    }

    public function query(UserIndexRequest $request, UserQuery $query): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', User::class);

        return UserResource::collection(
            $this->userList($request, $query)
        )->additional([
            'filters' => $request->filters(),
        ]);
    }

    private function userList(UserIndexRequest $request, UserQuery $query): LengthAwarePaginator
    {
        return $query->getUserList(
            search: $request->search(),
            role: $request->role(),
            page: $request->page(),
            perPage: $request->perPage(),
            sort: $request->sort(),
            direction: $request->direction(),
        );
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
