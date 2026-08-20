import PageHeader from '@/Components/Admin/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { App as AntdApp } from 'antd';
import BookForm from './Components/BookForm';

export default function Create() {
    const { message } = AntdApp.useApp();

    return (
        <AdminLayout title="Add book">
            <Head title="Add Book" />
            <PageHeader
                title="Add book"
                description="Create a catalogue record for a book held by the school library."
                breadcrumbs={[
                    { label: 'Books', href: route('admin.books.index') },
                    { label: 'Add book' },
                ]}
            />

            <div className="max-w-3xl">
                <BookForm
                    submitLabel="Save book"
                    url={route('admin.books.store')}
                    onSuccess={(payload) => {
                        message.success("Book created.");
                        router.get(route('admin.books.show', payload.book.id));
                    }}
                />
            </div>
        </AdminLayout>
    );
}
