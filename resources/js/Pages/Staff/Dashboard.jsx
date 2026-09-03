import InertiaButton from '@/Components/InertiaButton';
import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { Head } from '@inertiajs/react';
import { Card, Col, Flex, Row, Tag, Typography } from 'antd';

const plannedWorkflows = [
    { name: 'Loan renewal', detail: 'Extend eligible active loans under a defined renewal policy' },
    { name: 'Reporting', detail: 'Availability, overdue, and activity insights' },
    { name: 'Account security', detail: 'Disable user accounts independently from membership status'},
];

export default function Dashboard() {
    return (
        <StaffLayout title="Dashboard">
            <Head title="Dashboard" />

            <PageHeader
                eyebrow="Workspace"
                title="Library dashboard"
                description="Core issue and return workflows are live. Renewal, reporting, and account controls are planned next."
            />

            <Card
                title="Catalogue workspace"
                extra={<Tag color="success">Active</Tag>}
            >
                <Flex className="dashboard-feature" align="center" justify="space-between" gap={24} wrap>
                    <div className="dashboard-feature-copy">
                        <Typography.Title level={3}>
                            Keep every title findable and ready for circulation.
                        </Typography.Title>
                        <Typography.Paragraph type="secondary">
                            Create catalogue records, search by title, author, or ISBN,
                            and maintain copy counts from one focused workspace.
                        </Typography.Paragraph>
                    </div>
                    <Flex gap={8} wrap>
                        <InertiaButton href={route('staff.books.index')}>
                            Browse books
                        </InertiaButton>
                        <InertiaButton
                            href={route('staff.books.create')}
                            type="primary"
                            icon={<PlusOutlined />}
                        >
                            Add book
                        </InertiaButton>
                    </Flex>
                </Flex>
            </Card>

            <Card
                title="Next workflows"
                extra={<Typography.Text type="secondary">Planned</Typography.Text>}
                className="dashboard-next-card"
            >
                <Row gutter={[16, 16]}>
                    {plannedWorkflows.map((workflow) => (
                        <Col xs={24} md={8} key={workflow.name}>
                            <Card size="small" variant="outlined" className="planned-workflow-card">
                                <Typography.Text strong>{workflow.name}</Typography.Text>
                                <Typography.Paragraph type="secondary">
                                    {workflow.detail}
                                </Typography.Paragraph>
                                <Tag>Planned</Tag>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>
        </StaffLayout>
    );
}
