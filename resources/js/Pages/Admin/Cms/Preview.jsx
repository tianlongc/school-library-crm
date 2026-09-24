import StudentPortalCmsContent from '@/Components/Cms/StudentPortalCmsContent';
import MemberLayout from '@/Layouts/MemberLayout';
import IdcardOutlined from '@ant-design/icons/IdcardOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import ReadOutlined from '@ant-design/icons/ReadOutlined';
import { Head } from '@inertiajs/react';
import { Alert, Card, Col, Flex, Row, Tag, Typography } from 'antd';

export default function Preview({ content, homepageBooks = [] }) {
    return (
        <MemberLayout>
            <Head title="Draft preview - Student portal" />
            <Alert
                className="cms-preview-banner"
                description="Only authenticated administrators can see this draft. Students still see the published version."
                icon={<LockOutlined />}
                showIcon
                title="Private draft preview"
                type="info"
            />
            <Row className="member-dashboard-intro" gutter={[32, 32]} align="top">
                <Col xs={24} lg={15}>
                    <Typography.Title level={1} className="member-welcome-title">Welcome back, Student.</Typography.Title>
                    <Typography.Paragraph type="secondary" className="member-welcome-copy">This fixed welcome area represents the real student dashboard context.</Typography.Paragraph>
                </Col>
                <Col xs={24} lg={9}>
                    <Card className="member-card" title={<Flex align="center" gap={8}><IdcardOutlined /><span>Digital library card</span></Flex>} extra={<Tag color="success">Active</Tag>}>
                        <Typography.Text className="member-card-number-label">Member number</Typography.Text>
                        <Typography.Text className="member-card-number">STUDENT-001</Typography.Text>
                    </Card>
                </Col>
            </Row>
            <Card className="member-services-card" title={<Flex align="center" gap={8}><ReadOutlined /><span>Current loans</span></Flex>} extra={<Tag>Protected</Tag>}>
                <Typography.Text type="secondary">Loan data and return actions remain outside the page builder.</Typography.Text>
            </Card>
            <div className="cms-preview-editable-label"><span>Editable CMS area</span></div>
            <StudentPortalCmsContent books={homepageBooks} content={content} />
        </MemberLayout>
    );
}
