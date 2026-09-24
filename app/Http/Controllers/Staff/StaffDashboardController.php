<?php

namespace App\Http\Controllers\Staff;

use App\Domain\Loan\Models\Loan;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StaffDashboardController extends Controller
{
    public function __invoke(): Response
    {
        Gate::authorize('viewAny', Loan::class);

        return Inertia::render('Staff/Dashboard', [
            'attention' => [
                'overdue' => Loan::query()
                    ->whereNull('returned_at')
                    ->whereNull('return_requested_at')
                    ->where('due_at', '<', now())
                    ->count(),
                'return_requested' => Loan::query()
                    ->whereNull('returned_at')
                    ->whereNotNull('return_requested_at')
                    ->count(),
            ],
        ]);
    }
}
