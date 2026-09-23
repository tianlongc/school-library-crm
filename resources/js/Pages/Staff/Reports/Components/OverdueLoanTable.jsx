import ServerDataTable from "@/Components/Tables/ServerDataTable";
import { getSortOrder } from "@/Components/Tables/tableQuery";
import { Typography } from "antd";
import { useMemo } from "react";

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
});

const formatDate = (value) => value ? dateFormatter.format(new Date(value)) : '-';

export default function OverdueLoanTable({
    filters,
    loading,
    loans,
    meta,
    onPageChange,
    onTableChange,
}) {
    const columns = useMemo(
        () => [
            {
                title: 'Member',
                key: 'member_name',
                sorter: true,
                sortOrder: getSortOrder(filters, 'member_name'),
                width: 220,
                render: (_, loan) => (
                    <div className="min-w-0 py-1">
                        <Typography.Text strong>
                            {loan.member.name}
                        </Typography.Text>
                        <Typography.Text className="table-secondary-line" type="secondary">
                            {loan.member.member_number}
                        </Typography.Text>
                    </div>
                ),
            },
            {
                title: 'Book',
                key: 'book_title',
                sorter: true,
                sortOrder: getSortOrder(filters, 'book_title'),
                width: 280,
                render: (_, loan) => (
                    <div className="min-w-0 py-1">
                        <Typography.Text strong>
                            {loan.book.title}
                        </Typography.Text>
                        <Typography.Text
                            className="table-secondary-line"
                            type="secondary"
                        >
                            ISBN {loan.book.isbn}
                        </Typography.Text>
                    </div>
                ),
            },
            {
                title: 'Issued',
                dataIndex: 'issued_at',
                key: 'issued_at',
                width: 160,
                render: (issuedAt) => formatDate(issuedAt),
            },
            {
                title: 'Due',
                dataIndex: 'due_at',
                key: 'due_at',
                sorter: true,
                sortOrder: getSortOrder(filters, 'due_at'),
                width: 160,
                render: (dueAt) => (
                    <Typography.Text type="danger" strong>
                        {formatDate(dueAt)}
                    </Typography.Text>
                ),
            },
            {
                title: 'Overdue',
                dataIndex: 'overdue_days',
                key: 'overdue_days',
                align: 'center',
                width: 130,
                render: (days) => (
                    <Typography.Text type="danger" strong>
                        {days} {days === 1 ? 'day' : 'days'}
                    </Typography.Text>
                ),
            },
        ],
        [filters],
    );

    const isFiltered = Boolean(
        filters.search?.trim() || filters.from || filters.to,
    );

    return (
        <ServerDataTable
            columns={columns}
            data={loans}
            emptyText={
                isFiltered
                    ? 'No overdue loans match these filters.'
                    : 'No overdue loans were found.'
            }
            loading={loading}
            meta={meta}
            pluralName="loans"
            singularName="loan"
            scrollX={980}
            onPageChange={onPageChange}
            onTableChange={onTableChange}
        />
    );
}