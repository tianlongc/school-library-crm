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
    return_requested: {
        color: 'warning',
        label: 'Return requested',
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
    const [requestingReturnLoanId, setRequestingReturnLoanId] = useState(null);
    const { message, modal } = AntdApp.useApp();
    const canBrowseCatalogue = member.status !== 'inactive';
    const hasOverdueLoans = currentLoans.some((loan) => loan.is_overdue);

    const status = memberStatusColor[member.status] ?? {
        color: 'default',
        label: 'Unknown',
    };

    const requestReturn = (loan) => {
        modal.confirm({
            title: 'Request this return?',
            content: `Keep ${loan.book.title} with you until staff receives it. The loan remains active until they confirm the return.`,
            okText: 'Request return',
            cancelText: 'Keep book',
            async onOk() {
                setRequestingReturnLoanId(loan.id);

                try {
                    const payload = await jsonRequest({
                        url: route('member.loans.request-return', loan.id),
                        method: 'POST',
                    });

                    message.success(payload.message);
                    router.reload({ only: ['currentLoans'] });
                } catch (error) {
                    message.error(
                        getRequestErrorMessage(
                            error,
                            'The return request could not be submitted. Try again.',
                        ),
                    );

                    throw error;
                } finally {
                    setRequestingReturnLoanId(null);
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
                        request returns from this dashboard.
                    </Typography.Paragraph>
                    <Flex gap={8} wrap>
                        {canBrowseCatalogue ? (
                            <InertiaButton
                                href={route('member.books.index')}
                                type="primary"
                            >
                                Browse catalogue
                            </InertiaButton>
                        ) : (
                            <Alert
                                type="warning"
                                showIcon
                                title="Membership inactive"
                                description="You cannot browse or borrow books. You can still review and return your current loans."
                            />
                        )}
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
                                description="Staff must receive and confirm overdue returns before you can borrow another book."
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
                                const isReturnRequested =
                                    loan.status === 'return_requested';

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
                                                        loan.is_overdue
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
                                                disabled={isReturnRequested}
                                                loading={
                                                    requestingReturnLoanId === loan.id
                                                }
                                                onClick={() =>
                                                    requestReturn(loan)
                                                }
                                                size="small"
                                            >
                                                {isReturnRequested
                                                    ? 'Awaiting staff'
                                                    : 'Request return'}
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
