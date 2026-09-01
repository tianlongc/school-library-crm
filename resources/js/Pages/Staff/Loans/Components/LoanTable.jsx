import CheckOutlined from '@ant-design/icons/CheckOutlined';
import { Button, Space, Tag, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';

const statusColors = {
    active: 'processing',
    overdue: 'error',
    returned: 'default',
};

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const formatDate = (value) =>
    value ? dateFormatter.format(new Date(value)) : '—';

const formatDateTime = (value) =>
    value ? dateTimeFormatter.format(new Date(value)) : '—';

const titleCase = (value) =>
    value.charAt(0).toUpperCase() + value.slice(1);

function LoanAction({ canReturn, loan, onReturn }) {
    if (loan.returned_at) {
        return <Typography.Text type="secondary">Complete</Typography.Text>;
    }

    if (!canReturn) {
        return <Typography.Text type="secondary">—</Typography.Text>;
    }

    return (
        <Tooltip title="Record this book as returned">
            <Button
                aria-label={`Return ${loan.book.title} from ${loan.member.name}`}
                icon={<CheckOutlined />}
                onClick={() => onReturn(loan)}
                size="small"
                type="link"
            >
                Return
            </Button>
        </Tooltip>
    );
}

export default function LoanTable({
    canReturn,
    filters,
    loading,
    loans,
    meta,
    onPageChange,
    onReturn,
    onTableChange,
}) {
    const columns = useMemo(() => [
        {
            title: 'Member',
            key: 'member_name',
            sorter: true,
            sortOrder: getSortOrder(filters, 'member_name'),
            width: 230,
            render: (_, loan) => (
                <div className="min-w-0 py-1">
                    <Typography.Text strong>
                        {loan.member.name}
                    </Typography.Text>
                    <Typography.Text
                        className="table-secondary-line"
                        type="secondary"
                    >
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
            sorter: true,
            sortOrder: getSortOrder(filters, 'issued_at'),
            width: 175,
            render: (issuedAt, loan) => (
                <div>
                    <Typography.Text>
                        {formatDateTime(issuedAt)}
                    </Typography.Text>
                    <Typography.Text
                        className="table-secondary-line"
                        type="secondary"
                    >
                        by {loan.issued_by ?? 'Unknown staff'}
                    </Typography.Text>
                </div>
            ),
        },
        {
            title: 'Due / status',
            key: 'due_at',
            sorter: true,
            sortOrder: getSortOrder(filters, 'due_at'),
            width: 175,
            render: (_, loan) => (
                <Space orientation="vertical" size={4}>
                    <Typography.Text strong={loan.status === 'overdue'}>
                        {formatDate(loan.due_at)}
                    </Typography.Text>
                    <Tag color={statusColors[loan.status]}>
                        {titleCase(loan.status)}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Returned',
            key: 'returned_at',
            sorter: true,
            sortOrder: getSortOrder(filters, 'returned_at'),
            width: 175,
            render: (_, loan) =>
                loan.returned_at ? (
                    <div>
                        <Typography.Text>
                            {formatDateTime(loan.returned_at)}
                        </Typography.Text>
                        <Typography.Text
                            className="table-secondary-line"
                            type="secondary"
                        >
                            by {loan.returned_by ?? 'Unknown staff'}
                        </Typography.Text>
                    </div>
                ) : (
                    <Typography.Text type="secondary">—</Typography.Text>
                ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            fixed: 'right',
            width: 110,
            render: (_, loan) => (
                <LoanAction
                    canReturn={canReturn}
                    loan={loan}
                    onReturn={onReturn}
                />
            ),
        },
    ], [canReturn, filters, onReturn]);

    const isFiltered = Boolean(filters.search?.trim() || filters.status);

    return (
        <ServerDataTable
            columns={columns}
            data={loans}
            emptyText={
                isFiltered
                    ? 'No loans match these filters.'
                    : 'No loan records were found.'
            }
            loading={loading}
            meta={meta}
            pluralName="loans"
            rowClassName={(loan) => `loan-row loan-row-${loan.status}`}
            scrollX={1145}
            singularName="loan"
            onPageChange={onPageChange}
            onTableChange={onTableChange}
        />
    );
}
import ServerDataTable from '@/Components/Tables/ServerDataTable';
import { getSortOrder } from '@/Components/Tables/tableQuery';
