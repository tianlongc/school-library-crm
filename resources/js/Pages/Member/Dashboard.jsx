import InertiaButton from '@/Components/InertiaButton';
import MemberLayout from '@/Layouts/MemberLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import IdcardOutlined from '@ant-design/icons/IdcardOutlined';
import ReadOutlined from '@ant-design/icons/ReadOutlined';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Alert,
    App as AntdApp,
    Button,
    Card,
    Col,
    Empty,
    Flex,
    Row,
    Tag,
    Typography,
} from 'antd';
import { useState } from 'react';

const loanStatus = {
    active: {
        color: 'processing',
        label: 'Active',
    },
    overdue: {
        color: 'error',
        label: 'Overdue',
    },
};

const dueDateFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
});

const memberStatusColor = {
    active: {
        color: 'success',
        label: 'Active',
    },
    suspended: {
        color: 'warning',
        label: 'Suspended',
    },
    inactive: {
        color: 'default',
        label: 'Inactive',
    },
};

export default function Dashboard() {
    const { auth, currentLoans = [], member } = usePage().props;
    const [returningLoanId, setReturningLoanId] = useState(null);
    const { message, modal } = AntdApp.useApp();
    const hasOverdueLoans = currentLoans.some(
        (loan) => loan.status === 'overdue',
    );

    const status = memberStatusColor[member.status] ?? {
        color: 'default',
        label: 'Unknown',
    };

    const confirmReturn = (loan) => {
        modal.confirm({
            title: 'Return this book?',
            content: `${loan.book.title} will be removed from your current loans.`,
            okText: 'Return book',
            cancelText: 'Keep book',
            async onOk() {
                setReturningLoanId(loan.id);

                try {
                    const payload = await jsonRequest({
                        url: route('member.loans.return', loan.id),
                        method: 'POST',
                    });

                    message.success(payload.message);
                    router.reload({ only: ['currentLoans'] });
                } catch (error) {
                    message.error(
                        getRequestErrorMessage(
                            error,
                            'The book could not be returned. Try again.',
                        ),
                    );

                    throw error;
                } finally {
                    setReturningLoanId(null);
                }
            },
        });
    };

    return (
        <MemberLayout>
            <Head title="Member Dashboard" />

            <Row className="member-dashboard-intro" gutter={[32, 32]} align="top">
                <Col xs={24} lg={15}>
                    <Typography.Title level={1} className="member-welcome-title">
                        Welcome back, {auth.user.name}.
                    </Typography.Title>
                    <Typography.Paragraph type="secondary" className="member-welcome-copy">
                        Browse available books, borrow them from the catalogue, and
                        return current loans from this dashboard.
                    </Typography.Paragraph>
                    <Flex gap={8} wrap>
                        <InertiaButton
                            href={route('member.books.index')}
                            type="primary"
                        >
                            Browse catalogue
                        </InertiaButton>
                        <InertiaButton href={route('profile.edit')}>
                            Review account details
                        </InertiaButton>
                    </Flex>
                </Col>
                <Col xs={24} lg={9}>
                    <Card
                        className="member-card"
                        title={
                            <Flex align="center" gap={8}>
                                <IdcardOutlined aria-hidden="true" />
                                <span>Digital library card</span>
                            </Flex>
                        }
                        extra={<Tag color={status.color}>{status.label}</Tag>}
                    >
                        <Flex gap={24} justify="space-between" vertical>
                            <div>
                                <Typography.Text className="member-card-number-label">
                                    Member number
                                </Typography.Text>
                                <Typography.Text
                                    className="member-card-number"
                                    translate="no"
                                >
                                    {member.member_number}
                                </Typography.Text>
                            </div>

                            <Flex
                                align="flex-end"
                                className="member-card-meta"
                                gap={16}
                                justify="space-between"
                            >
                                <div className="min-w-0">
                                    <Typography.Text className="member-card-meta-label">
                                        Cardholder
                                    </Typography.Text>
                                    <Typography.Text className="member-card-holder">
                                        {auth.user.name}
                                    </Typography.Text>
                                </div>
                                <Typography.Text className="member-card-account-type">
                                    Member account
                                </Typography.Text>
                            </Flex>
                        </Flex>
                    </Card>
                </Col>
            </Row>

            <Card
                className="member-services-card"
                extra={
                    <Tag>
                        {currentLoans.length}{' '}
                        {currentLoans.length === 1 ? 'book' : 'books'}
                    </Tag>
                }
                title={
                    <Flex align="center" gap={8}>
                        <ReadOutlined aria-hidden="true" />
                        <span>Current loans</span>
                    </Flex>
                }
            >
                {currentLoans.length === 0 ? (
                    <Empty
                        description="You have no books on loan."
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Flex vertical gap={16}>
                        {hasOverdueLoans && (
                            <Alert
                                description="Return overdue books before borrowing another book."
                                showIcon
                                title="Borrowing is temporarily blocked"
                                type="warning"
                            />
                        )}

                        <div className="member-loan-list">
                            {currentLoans.map((loan) => {
                                const statusDetails = loanStatus[loan.status] ?? {
                                    color: 'default',
                                    label: 'Unknown',
                                };

                                return (
                                    <article
                                        key={loan.id}
                                        className="member-loan-row"
                                    >
                                        <Flex
                                            align="flex-start"
                                            gap={16}
                                            justify="space-between"
                                            wrap
                                        >
                                            <div className="min-w-0 flex-1">
                                                <Typography.Title
                                                    className="member-loan-title"
                                                    level={4}
                                                >
                                                    {loan.book.title}
                                                </Typography.Title>
                                                <Typography.Text
                                                    className="table-secondary-line"
                                                    type="secondary"
                                                >
                                                    ISBN {loan.book.isbn}
                                                </Typography.Text>
                                            </div>
                                            <Tag color={statusDetails.color}>
                                                {statusDetails.label}
                                            </Tag>
                                        </Flex>

                                        <Flex
                                            align="flex-end"
                                            className="member-loan-footer"
                                            gap={12}
                                            justify="space-between"
                                            wrap
                                        >
                                            <div>
                                                <Typography.Text className="member-loan-date-label">
                                                    Due date
                                                </Typography.Text>
                                                <Typography.Text
                                                    className="member-loan-date"
                                                    type={
                                                        loan.status === 'overdue'
                                                            ? 'danger'
                                                            : undefined
                                                    }
                                                >
                                                    <time dateTime={loan.due_at}>
                                                        {dueDateFormatter.format(
                                                            new Date(loan.due_at),
                                                        )}
                                                    </time>
                                                </Typography.Text>
                                            </div>
                                            <Button
                                                loading={
                                                    returningLoanId === loan.id
                                                }
                                                onClick={() =>
                                                    confirmReturn(loan)
                                                }
                                                size="small"
                                            >
                                                Return book
                                            </Button>
                                        </Flex>
                                    </article>
                                );
                            })}
                        </div>
                    </Flex>
                )}
            </Card>
        </MemberLayout>
    );
}
