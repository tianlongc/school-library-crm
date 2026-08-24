import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { App as AntdApp } from 'antd';
import CategoryForm from './Components/CategoryForm';

export default function Edit({ category }) {
    const { message } = AntdApp.useApp();

    return (
        <StaffLayout title="Edit category">
            <Head title={`Edit ${category.name}`} />
            <PageHeader
                title="Edit category"
                description="Update this subject label everywhere it appears in the catalogue."
                breadcrumbs={[
                    { label: 'Categories', href: route('staff.categories.index') },
                    { label: category.name },
                ]}
            />

            <div className="max-w-3xl">
                <CategoryForm
                    category={category}
                    submitLabel="Save changes"
                    url={route('staff.categories.update', category.id)}
                    onSuccess={() => {
                        message.success('Category updated.');
                        router.get(route('staff.categories.index'));
                    }}
                />
            </div>
        </StaffLayout>
    );
}
