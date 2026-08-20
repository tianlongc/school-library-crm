import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { App as AntdApp } from 'antd';
import BookForm from './Components/BookForm';

export default function Edit({ book }) {
    const { message } = AntdApp.useApp();

    return (
        <StaffLayout title="Edit book">
            <Head title={`Edit ${book.title}`} />
            <PageHeader
                title="Edit book"
                description="Update this book’s catalogue information and copy count."
                breadcrumbs={[
                    { label: 'Books', href: route('staff.books.index') },
                    { label: book.title, href: route('staff.books.show', book.id) },
                    { label: 'Edit' },
                ]}
            />

            <div className="max-w-3xl">
                <BookForm
                    book={book}
                    submitLabel="Save changes"
                    url={route('staff.books.update', book.id)}
                    onSuccess={() => {
                        message.success('Book updated.');
                        router.get(route('staff.books.show', book.id));
                    }}
                />
            </div>
        </StaffLayout>
    );
}
