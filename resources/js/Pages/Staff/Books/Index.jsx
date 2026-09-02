import InertiaButton from '@/Components/InertiaButton';
import PageHeader from '@/Components/PageHeader';
import TableSearchInput from '@/Components/Tables/TableSearchInput';
import { useServerTable } from '@/Components/Tables/useServerTable';
import StaffLayout from '@/Layouts/StaffLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { Head } from '@inertiajs/react';
import { App as AntdApp, Card } from 'antd';
import { useEffect } from 'react';
import BookTable from './Components/BookTable';

export default function Index({ books: initialBooks, filters: initialFilters }) {
    const { message, modal } = AntdApp.useApp();
    const {
        error,
        filters,
        handlePageChange,
        handleTableChange,
        loading,
        refresh,
        resource: books,
        search,
        setSearch,
    } = useServerTable({
        initialFilters,
        initialResource: initialBooks,
        queryRouteName: 'staff.books.query',
    });

    useEffect(() => {
        if (error) {
            message.error(
                getRequestErrorMessage(
                    error,
                    'The book table could not be refreshed. Try again.',
                ),
            );
        }
    }, [error, message]);

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
                    await refresh();
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
                    </span>
                }
                extra={
                    <TableSearchInput
                        ariaLabel="Search books"
                        placeholder="Search title, author or ISBN"
                        value={search}
                        onChange={setSearch}
                    />
                }
                styles={{ body: { padding: 0 } }}
            >
                <BookTable
                    books={books.data}
                    filters={filters}
                    loading={loading}
                    meta={books.meta}
                    onDelete={confirmDelete}
                    onPageChange={handlePageChange}
                    onTableChange={handleTableChange}
                />
            </Card>
        </StaffLayout>
    );
}
