import ServerDataTable from '@/Components/Tables/ServerDataTable';
import { getSortOrder } from '@/Components/Tables/tableQuery';
import CheckOutlined from '@ant-design/icons/CheckOutlined';
import RedoOutlined from '@ant-design/icons/RedoOutlined';
import { Button, Space, Tag, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';

const statusColors = {
    active: 'processing',
    overdue: 'error',
    return_requested: 'warning',
    returned: 'default',
};

const statusLabels = {
    active: 'Active',
    overdue: 'Overdue',
    return_requested: 'Return requested',
    returned: 'Returned',
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

function LoanAction({ canRenew, canReturn, loan, onRenew, onReturn }) {
    if (loan.returned_at) {
        return <Typography.Text type="secondary">Complete</Typography.Text>;
    }

    const isReturnRequested = loan.status === 'return_requested';
    const isRenewable =
        canRenew &&
        loan.status === 'active' &&
        (loan.renewal_count ?? 0) === 0;

    if (!isRenewable && !canReturn) {
        return <Typography.Text type="secondary">—</Typography.Text>;
    }

    return (
        <Space size={4} wrap>
            {isRenewable ? (
                <Tooltip title="Extend the current due date by 14 days">
                    <Button
                        aria-label={`Renew ${loan.book.title} for ${loan.member.name}`}
                        icon={<RedoOutlined />}
                        onClick={() => onRenew(loan)}
                        size="small"
                        type="link"
                    >
                        Renew
                    </Button>
                </Tooltip>
            ) : null}

            {canReturn ? (
                <Tooltip
                    title={
                        isReturnRequested
                            ? 'Confirm the returned book was received'
                            : 'Record this book as returned'
                    }
                >
                    <Button
                        aria-label={
                            isReturnRequested
                                ? `Confirm receipt of ${loan.book.title} from ${loan.member.name}`
                                : `Return ${loan.book.title} from ${loan.member.name}`
                        }
                        icon={<CheckOutlined />}
                        onClick={() => onReturn(loan)}
                        size="small"
                        type={isReturnRequested ? 'primary' : 'link'}
                    >
                        {isReturnRequested ? 'Confirm received' : 'Return'}
                    </Button>
                </Tooltip>
            ) : null}
        </Space>
    );
}

export default function LoanTable({
    canRenew,
    canReturn,
    filters,
    loading,
    loans,
    meta,
    onPageChange,
    onRenew,
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
                    <Typography.Text
                        strong={loan.is_overdue}
                        type={loan.is_overdue ? 'danger' : undefined}
                    >
                        {formatDate(loan.due_at)}
                    </Typography.Text>
                    <Space size={[0, 4]} wrap>
                        <Tag color={statusColors[loan.status]}>
                            {statusLabels[loan.status] ?? 'Unknown'}
                        </Tag>
                        {loan.renewal_count > 0 ? (
                            <Tag color="blue">Renewed once</Tag>
                        ) : null}
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Return activity',
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
                ) : loan.return_requested_at ? (
                    <div>
                        <Typography.Text>
                            {formatDateTime(loan.return_requested_at)}
                        </Typography.Text>
                        <Typography.Text
                            className="table-secondary-line"
                            type="secondary"
                        >
                            Awaiting staff confirmation
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
            width: 230,
            render: (_, loan) => (
                <LoanAction
                    canRenew={canRenew}
                    canReturn={canReturn}
                    loan={loan}
                    onRenew={onRenew}
                    onReturn={onReturn}
                />
            ),
        },
    ], [canRenew, canReturn, filters, onRenew, onReturn]);

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
            scrollX={1290}
            singularName="loan"
            onPageChange={onPageChange}
            onTableChange={onTableChange}
        />
    );
}
