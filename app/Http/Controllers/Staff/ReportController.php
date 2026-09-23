<?php

namespace App\Http\Controllers\Staff;

use App\Domain\Loan\Queries\LoanReportQuery;
use App\Exports\OverdueLoansExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Report\OverdueLoanReportRequest;
use App\Http\Resources\LoanReportResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function overdue(OverdueLoanReportRequest $request, LoanReportQuery $query): Response
    {
        return Inertia::render('Staff/Reports/Overdue', [
            'loans' => fn () => LoanReportResource::collection(
                $query->paginateOverdue(
                    search: $request->search(),
                    from: $request->from(),
                    to: $request->to(),
                    page: $request->page(),
                    perPage: $request->perPage(),
                    sort: $request->sort(),
                    direction: $request->direction(),
                ),
            ),
            'filters' => $request->filters(),
        ]);
    }

    public function overdueQuery(
        OverdueLoanReportRequest $request,
        LoanReportQuery $query,
    ): AnonymousResourceCollection {
        return LoanReportResource::collection(
            $query->paginateOverdue(
                search: $request->search(),
                from: $request->from(),
                to: $request->to(),
                page: $request->page(),
                perPage: $request->perPage(),
                sort: $request->sort(),
                direction: $request->direction(),
            ),
        )->additional([
            'filters' => $request->filters(),
        ]);
    }

    public function overdueExport(
        OverdueLoanReportRequest $request,
        LoanReportQuery $query,
    ): BinaryFileResponse {
        return Excel::download(
            new OverdueLoansExport(
                reportQuery: $query,
                search: $request->search(),
                from: $request->from(),
                to: $request->to(),
            ),
            'overdue-loans-'.now()->format('Y-m-d').'.xlsx',
        );
    }
}
