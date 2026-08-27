import InertiaButton from '@/Components/InertiaButton';
import MemberLayout from '@/Layouts/MemberLayout';
import { Head, usePage } from '@inertiajs/react';
import {
    Card,
    Col,
    Descriptions,
    Empty,
    Flex,
    Row,
    Tag,
    Typography,
} from 'antd';

const plannedServices = [
    'Search the school catalogue',
    'Follow availability and borrowing status',
];

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

    const status = memberStatusColor[member.status] ?? {
        color: 'default',
        label: 'Unknown',
    }

    return (
        <MemberLayout>
            <Head title="Member Dashboard" />

            <Row gutter={[32, 32]} align="top">
                <Col xs={24} lg={15}>
                    <Typography.Text className="app-page-eyebrow">
                        Your library account
                    </Typography.Text>
                    <Typography.Title level={1} className="member-welcome-title">
                        Welcome, {auth.user.name}.
                    </Typography.Title>
                    <Typography.Paragraph type="secondary" className="member-welcome-copy">
                        Your member account is ready. Catalogue discovery and borrowing
                        tools will appear here as those library services are connected.
                    </Typography.Paragraph>
                    <Flex gap={8} wrap>
                        <InertiaButton href={route('profile.edit')} type="primary">
                            Review account details
                        </InertiaButton>
                        <InertiaButton href="/">Library home</InertiaButton>
                    </Flex>
                </Col>
                <Col xs={24} lg={9}>
                    <Card
                        className="member-card"
                        title="Digital library card"
                        extra={<Tag color="success">Signed in</Tag>}
                    >
                        <Typography.Title level={3}>Library member</Typography.Title>
                        <Descriptions
                            column={1}
                            items={[
                                {
                                    key: 'number',
                                    label: 'Member number',
                                    children: member.member_number,
                                },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    children: <Tag color={status.color}>{status.label}</Tag>,
                                },
                            ]}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                className="member-services-card"
                extra={
                    <Typography.Text type="secondary">
                        {currentLoans.length}{' '}
                        {currentLoans.length === 1 ? 'book' : 'books'}
                    </Typography.Text>
                }
                title="Current loans"
            >
                {currentLoans.length === 0 ? (
                    <Empty
                        description="You have no books on loan."
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {currentLoans.map((loan) => {
                            const statusDetails = loanStatus[loan.status] ?? {
                                color: 'default',
                                label: 'Unknown',
                            };

                            return (
                                <Card
                                    key={loan.id}
                                    className="member-loan-card"
                                    size="small"
                                    variant="outlined"
                                >
                                    <Flex
                                        align="flex-start"
                                        gap={16}
                                        justify="space-between"
                                    >
                                        <div className="min-w-0">
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
                                        <Tag color={statusDetails.color}>
                                            {statusDetails.label}
                                        </Tag>
                                    </Flex>

                                    <Typography.Text
                                        className="member-loan-due"
                                        type={
                                            loan.status === 'overdue'
                                                ? 'danger'
                                                : 'secondary'
                                        }
                                    >
                                        Due{' '}
                                        {dueDateFormatter.format(
                                            new Date(loan.due_at),
                                        )}
                                    </Typography.Text>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </Card>

            <Card title="Member library services" className="member-services-card">
                <Typography.Paragraph type="secondary">
                    These catalogue experiences will become interactive as the next
                    library services are connected.
                </Typography.Paragraph>
                <Row gutter={[16, 16]}>
                    {plannedServices.map((service) => (
                        <Col xs={24} md={12} key={service}>
                            <Card size="small" variant="outlined">
                                <Typography.Text strong>{service}</Typography.Text>
                                <div className="planned-service-tag">
                                    <Tag>Planned</Tag>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>
        </MemberLayout>
    );
}
