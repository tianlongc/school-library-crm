import PageHeader from '@/Components/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import MemberLayout from '@/Layouts/MemberLayout';
import StaffLayout from '@/Layouts/StaffLayout';
import { Head, usePage } from '@inertiajs/react';
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

            <div className="grid gap-6 xl:grid-cols-2">
                <section className="ui-panel p-5 sm:p-7">
                    <div className="max-w-2xl">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>
                </section>

                <section className="ui-panel p-5 sm:p-7">
                    <div className="max-w-2xl">
                        <UpdatePasswordForm />
                    </div>
                </section>

                <section className="ui-panel border-rose-200 p-5 sm:p-7 xl:col-span-2">
                    <div className="max-w-2xl">
                        <DeleteUserForm />
                    </div>
                </section>
            </div>
        </AccountLayout>
    );
}
