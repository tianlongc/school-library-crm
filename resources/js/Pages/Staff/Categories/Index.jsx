import InertiaButton from '@/Components/InertiaButton';
import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Head, router } from '@inertiajs/react';
import { App as AntdApp, Card, Input, Typography } from 'antd';
import { useState } from 'react';
import CategoryTable from './Components/CategoryTable';

export default function Index({ categories, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [loading, setLoading] = useState(false);
    const { message, modal } = AntdApp.useApp();

    const visitCategories = (parameters) => {
        router.get(route('staff.categories.index'), parameters, {
            preserveState: true,
            replace: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };

    const submitSearch = (value) => {
        const normalizedSearch = value.trim();
        visitCategories(normalizedSearch ? { search: normalizedSearch } : {});
    };

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
                        <Typography.Text type="secondary" className="directory-count">
                            {categories.meta.total} total
                        </Typography.Text>
                    </span>
                }
                extra={
                    <Input.Search
                        allowClear
                        aria-label="Search categories"
                        enterButton={<SearchOutlined />}
                        onChange={(event) => setSearch(event.target.value)}
                        onSearch={submitSearch}
                        placeholder="Search category name"
                        value={search}
                    />
                }
                styles={{ body: { padding: 0 } }}
            >
                <CategoryTable
                    categories={categories.data}
                    loading={loading}
                    search={filters.search}
                    meta={categories.meta}
                    onDelete={confirmDelete}
                    onPageChange={(page) =>
                        visitCategories({
                            ...(filters.search ? { search: filters.search } : {}),
                            page,
                        })
                    }
                />
            </Card>
        </StaffLayout>
    );
}
