import CheckOutlined from '@ant-design/icons/CheckOutlined';
import { Button, Empty, Flex, Pagination, Space, Table, Tag, Tooltip, Typography } from 'antd';

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
    loading,
    loans,
    meta,
    onPageChange,
    onReturn,
    search,
    status,
}) {
    const columns = [
        {
            title: 'Member',
            key: 'member',
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
            key: 'book',
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
    ];

    const isFiltered = Boolean(search?.trim() || status);

    return (
        <>
            <Table
                columns={columns}
                dataSource={loans}
                loading={loading}
                locale={{
                    emptyText: (
                        <Empty
                            description={
                                isFiltered
                                    ? 'No loans match these filters.'
                                    : 'No loan records were found.'
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ),
                }}
                pagination={false}
                rowClassName={(loan) => `loan-row loan-row-${loan.status}`}
                rowKey="id"
                scroll={{ x: 1145 }}
                size="middle"
            />

            {meta.total > 0 && (
                <Flex
                    align="center"
                    className="table-pagination"
                    gap={16}
                    justify="space-between"
                    wrap
                >
                    <Typography.Text type="secondary">
                        {meta.total} {meta.total === 1 ? 'loan' : 'loans'}
                    </Typography.Text>

                    <Pagination
                        current={meta.current_page}
                        onChange={onPageChange}
                        pageSize={meta.per_page}
                        showSizeChanger={false}
                        showTitle
                        total={meta.total}
                    />
                </Flex>
            )}
        </>
    );
}
