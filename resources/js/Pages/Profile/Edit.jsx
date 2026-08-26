import PageHeader from '@/Components/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import MemberLayout from '@/Layouts/MemberLayout';
import StaffLayout from '@/Layouts/StaffLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, Col, Row } from 'antd';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

function AccountLayout({ children }) {
    const { auth } = usePage().props;

    if (auth.can.viewAdminDashboard) {
        return <AdminLayout title="Account settings">{children}</AdminLayout>;
    }

    if (auth.can.accessStaffWorkspace) {
        return <StaffLayout title="Account settings">{children}</StaffLayout>;
    }

    return <MemberLayout>{children}</MemberLayout>;
}

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AccountLayout>
            <Head title="Account settings" />

            <PageHeader
                eyebrow="Account"
                title="Account settings"
                description="Keep your profile information and sign-in credentials up to date."
            />

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={12}>
                    <Card>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={12}>
                    <Card>
                        <UpdatePasswordForm />
                    </Card>
                </Col>
                <Col span={24}>
                    <Card className="danger-zone-card">
                        <DeleteUserForm />
                    </Card>
                </Col>
            </Row>
        </AccountLayout>
    );
}
