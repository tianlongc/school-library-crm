import InertiaButton from '@/Components/InertiaButton';
import PageHeader from '@/Components/PageHeader';
import TableSearchInput from '@/Components/Tables/TableSearchInput';
import { useServerTable } from '@/Components/Tables/useServerTable';
import StaffLayout from '@/Layouts/StaffLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { Head, router } from '@inertiajs/react';
import { App as AntdApp, Card } from 'antd';
import CategoryTable from './Components/CategoryTable';

export default function Index({ categories, filters }) {
    const { message, modal } = AntdApp.useApp();
    const {
        handlePageChange,
        handleTableChange,
        loading,
        search,
        setSearch,
    } = useServerTable({
        filters,
        resource: 'categories',
        routeName: 'staff.categories.index',
    });

    const confirmDelete = (category) => {
        modal.confirm({
            title: 'Delete category?',
            content: `Delete “${category.name}”? Its books will stay in the catalogue and become uncategorized.`,
            okText: 'Delete category',
            cancelText: 'Keep category',
            okButtonProps: { danger: true },
            async onOk() {
                try {
                    await jsonRequest({
                        url: route('staff.categories.destroy', category.id),
                        method: 'DELETE',
                    });

                    message.success('Category deleted.');
                    router.reload({ only: ['categories'] });
                } catch (error) {
                    message.error(
                        getRequestErrorMessage(
                            error,
                            'The category could not be deleted. Try again.',
                        ),
                    );

                    throw error;
                }
            },
        });
    };

    return (
        <StaffLayout title="Categories">
            <Head title="Categories" />
            <PageHeader
                eyebrow="Classification"
                title="Categories"
                description="Keep the catalogue organized with clear, reusable subject labels."
                actions={
                    <InertiaButton
                        href={route('staff.categories.create')}
                        type="primary"
                        icon={<PlusOutlined />}
                    >
                        Add category
                    </InertiaButton>
                }
            />

            <Card
                className="directory-card"
                title={
                    <span>
                        Category directory
                    </span>
                }
                extra={
                    <TableSearchInput
                        ariaLabel="Search categories"
                        placeholder="Search category name"
                        value={search}
                        onChange={setSearch}
                    />
                }
                styles={{ body: { padding: 0 } }}
            >
                <CategoryTable
                    categories={categories.data}
                    filters={filters}
                    loading={loading}
                    meta={categories.meta}
                    onDelete={confirmDelete}
                    onPageChange={handlePageChange}
                    onTableChange={handleTableChange}
                />
            </Card>
        </StaffLayout>
    );
}
