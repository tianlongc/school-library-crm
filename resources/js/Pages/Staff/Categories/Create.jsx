import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { App as AntdApp } from 'antd';
import CategoryForm from './Components/CategoryForm';

export default function Create() {
    const { message } = AntdApp.useApp();

    return (
        <StaffLayout title="Add category">
            <Head title="Add Category" />
            <PageHeader
                title="Add category"
                description="Create a subject label that can be assigned to books across the catalogue."
                breadcrumbs={[
                    { label: 'Categories', href: route('staff.categories.index') },
                    { label: 'Add category' },
                ]}
            />

            <div className="max-w-3xl">
                <CategoryForm
                    submitLabel="Save category"
                    url={route('staff.categories.store')}
                    onSuccess={() => {
                        message.success('Category created.');
                        router.get(route('staff.categories.index'));
                    }}
                />
            </div>
        </StaffLayout>
    );
}
