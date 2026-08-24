import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { App as AntdApp } from 'antd';
import BookForm from './Components/BookForm';

export default function Create() {
    const { message } = AntdApp.useApp();

    return (
        <StaffLayout title="Add book">
            <Head title="Add Book" />
            <PageHeader
                title="Add book"
                description="Create a catalogue record for a book held by the school library."
                breadcrumbs={[
                    { label: 'Books', href: route('staff.books.index') },
                    { label: 'Add book' },
                ]}
            />

            <div className="max-w-3xl">
                <BookForm
                    submitLabel="Save book"
                    url={route('staff.books.store')}
                    onSuccess={(payload) => {
                        message.success("Book created.");
                        router.get(route('staff.books.show', payload.book.id));
                    }}
                />
            </div>
        </StaffLayout>
    );
}
