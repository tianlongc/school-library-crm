import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { App as AntdApp } from 'antd';
import LoanForm from './Components/LoanForm';

export default function Create() {
    const { message } = AntdApp.useApp();

    return (
        <StaffLayout title="Issue loan">
            <Head title="Issue Loan" />

            <PageHeader
                breadcrumbs={[
                    { label: 'Loans', href: route('staff.loans.index') },
                    { label: 'Issue loan' },
                ]}
                description="Record a member borrowing an available library book."
                title="Issue loan"
            />

            <div className="max-w-3xl">
                <LoanForm
                    onSuccess={(payload) => {
                        message.success(payload.message);
                        router.get(route('staff.loans.index'));
                    }}
                />
            </div>
        </StaffLayout>
    );
}
