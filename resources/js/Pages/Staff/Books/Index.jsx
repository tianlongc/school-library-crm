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
import BookTable from './Components/BookTable';

export default function Index({ books, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [loading, setLoading] = useState(false);
    const { message, modal } = AntdApp.useApp();

    const visitBooks = (parameters) => {
        router.get(route('staff.books.index'), parameters, {
            preserveState: true,
            replace: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };

    const submitSearch = (value) => {
        const normalizedSearch = value.trim();
        visitBooks(normalizedSearch ? { search: normalizedSearch } : {});
    };

    const confirmDelete = (book) => {
        modal.confirm({
            title: 'Delete book?',
            content: `Delete “${book.title}”? It will be removed from the active catalogue.`,
            okText: 'Delete book',
            cancelText: 'Keep book',
            okButtonProps: { danger: true },
            async onOk() {
                try {
                    await jsonRequest({
                        url: route('staff.books.destroy', book.id),
                        method: 'DELETE',
                    });

                    message.success('Book deleted.');
                    router.reload({ only: ['books'] });
                } catch (error) {
                    message.error(
                        getRequestErrorMessage(
                            error,
                            'The book could not be deleted. Try again.',
                        ),
                    );

                    throw error;
                }
            },
        });
    };

    return (
        <StaffLayout title="Books">
            <Head title="Books" />
            <PageHeader
                eyebrow="Catalogue"
                title="Books"
                description="Manage books available in the school library."
                actions={
                    <InertiaButton
                        href={route('staff.books.create')}
                        type="primary"
                        icon={<PlusOutlined />}
                    >
                        Add book
                    </InertiaButton>
                }
            />

            <Card
                className="directory-card"
                title={
                    <span>
                        Book catalogue
                        <Typography.Text type="secondary" className="directory-count">
                            {books.meta.total} total
                        </Typography.Text>
                    </span>
                }
                extra={
                    <Input.Search
                        allowClear
                        aria-label="Search books"
                        enterButton={<SearchOutlined />}
                        onChange={(event) => setSearch(event.target.value)}
                        onSearch={submitSearch}
                        placeholder="Search title, author or ISBN"
                        value={search}
                    />
                }
                styles={{ body: { padding: 0 } }}
            >
                <BookTable
                    books={books.data}
                    loading={loading}
                    search={filters.search}
                    meta={books.meta}
                    onDelete={confirmDelete}
                    onPageChange={(page) =>
                        visitBooks({
                            ...(filters.search ? { search: filters.search } : {}),
                            page,
                        })
                    }
                />
            </Card>
        </StaffLayout>
    );
}
