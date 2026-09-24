import InertiaButton from '@/Components/InertiaButton';
import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { Head, usePage } from '@inertiajs/react';
import { Card, Divider, Flex, Typography } from 'antd';

export default function Dashboard({ attention }) {
    const { auth } = usePage().props;

    return (
        <StaffLayout title="Dashboard">
            <Head title="Dashboard" />

            <PageHeader
                actions={
                    auth.can.issueLoans ? (
                        <InertiaButton
                            href={route('staff.loans.create')}
                            icon={<PlusOutlined />}
                            type="primary"
                        >
                            Issue loan
                        </InertiaButton>
                    ) : undefined
                }
                description="Start a loan or resolve books that need staff attention."
                title="Circulation desk"
            />

            <Card className="max-w-4xl" title="Needs attention">
                <Flex align="center" gap={16} justify="space-between" wrap>
                    <div>
                        <Typography.Title level={3} style={{ marginBottom: 0 }}>
                            {attention.overdue} overdue loans
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            Books past their due date without a return request.
                        </Typography.Text>
                    </div>
                    <InertiaButton href={route('staff.loans.index', { status: 'overdue' })}>
                        Review overdue
                    </InertiaButton>
                </Flex>

                <Divider />

                <Flex align="center" gap={16} justify="space-between" wrap>
                    <div>
                        <Typography.Title level={3} style={{ marginBottom: 0 }}>
                            {attention.return_requested} return requests
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            Confirm books received before closing these loans.
                        </Typography.Text>
                    </div>
                    <InertiaButton href={route('staff.loans.index', { status: 'return_requested' })}>
                        Review requests
                    </InertiaButton>
                </Flex>
            </Card>

            <Flex className="mt-6" gap={8} wrap>
                <InertiaButton href={route('staff.loans.index')}>All loans</InertiaButton>
            </Flex>
        </StaffLayout>
    );
}
