<?php

namespace App\Exports;

use App\Domain\Loan\Models\Loan;
use App\Domain\Loan\Queries\LoanReportQuery;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use LogicException;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\DefaultValueBinder;
use Override;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class OverdueLoansExport extends DefaultValueBinder implements
    FromQuery,
    WithHeadings,
    WithMapping,
    WithColumnFormatting,
    WithCustomValueBinder
{
    use Exportable;

    public function __construct(
        private readonly LoanReportQuery $reportQuery,
        private readonly string $search = '',
        private readonly ?CarbonImmutable $from = null,
        private readonly ?CarbonImmutable $to = null,
    ) {}

    public function query(): Builder
    {
        return $this->reportQuery->exportOverdue(
            search: $this->search,
            from: $this->from,
            to: $this->to,
        );
    }

    /**
     * @return list<string>
     */
    #[Override]
    public function headings(): array
    {
        return [
            'Member Number',
            'Member Name',
            'Book Title',
            'ISBN',
            'Issued Date',
            'Due Date',
            'Overdue Days',
        ];
    }

    /**
     * @return list<string|int>
     */
    #[Override]
    public function map(mixed $row): array
    {
        if (!$row instanceof Loan) {
            throw new LogicException('Expected an overdue loan row.');
        }

        return [
            $row->member->member_number,
            $row->member->user->name,
            $row->book->title,
            (string) $row->book->isbn,
            $row->issued_at->format('Y-m-d'),
            $row->due_at->format('Y-m-d'),
            (int)$row->due_at->diffInDays(now()),
        ];
    }

    /**
     * Force the ISBN column to use Excel's text format.
     *
     * @return array<string, string>
     */
    #[Override]
    public function columnFormats(): array
    {
        return [
            'D' => NumberFormat::FORMAT_TEXT,
        ];
    }

    #[Override]
    public function bindValue(Cell $cell, mixed $value): bool
    {
        if ($cell->getColumn() === 'D' && $value !== null) {
            $cell->setValueExplicit(
                (string) $value,
                DataType::TYPE_STRING,
            );

            return true;
        }

        return parent::bindValue($cell, $value);
    }
}
