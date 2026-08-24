import PageHeader from '@/Components/Admin/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { App as AntdApp } from 'antd';
import BookForm from './Components/BookForm';

export default function Edit({ book }) {
    const { message } = AntdApp.useApp();

    return (
        <AdminLayout title="Edit book">
            <Head title={`Edit ${book.title}`} />
            <PageHeader
                title="Edit book"
                description="Update this book’s catalogue information and copy count."
                breadcrumbs={[
                    { label: 'Books', href: route('admin.books.index') },
                    { label: book.title, href: route('admin.books.show', book.id) },
                    { label: 'Edit' },
                ]}
            />

            <div className="max-w-3xl">
                <BookForm
                    book={book}
                    submitLabel="Save changes"
                    url={route('admin.books.update', book.id)}
                    onSuccess={() => {
                        message.success('Book updated.');
                        router.get(route('admin.books.show', book.id));
                    }}
                />
            </div>
        </AdminLayout>
    );
}
