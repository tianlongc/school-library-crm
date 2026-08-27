import InertiaButton from '@/Components/InertiaButton';
import MemberLayout from '@/Layouts/MemberLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, Col, Descriptions, Flex, Row, Tag, Typography } from 'antd';

const plannedServices = [
    'Search the school catalogue',
    'See current loans and due dates',
    'Follow availability and borrowing status',
];

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
    const { auth, member } = usePage().props;

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

            <Card title="Member library services" className="member-services-card">
                <Typography.Paragraph type="secondary">
                    These experiences need catalogue and circulation endpoints before
                    they become interactive.
                </Typography.Paragraph>
                <Row gutter={[16, 16]}>
                    {plannedServices.map((service) => (
                        <Col xs={24} md={8} key={service}>
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
