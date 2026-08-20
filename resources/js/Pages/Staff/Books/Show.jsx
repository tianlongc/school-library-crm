import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { Head, Link } from '@inertiajs/react';

function formatDate(value) {
    if (!value) {
        return 'Not available';
    }

    return new Intl.DateTimeFormat('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function DetailItem({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
            <dd className="mt-1.5 text-sm font-medium text-slate-900">{children}</dd>
        </div>
    );
}

export default function Show({ book }) {
    return (
        <StaffLayout title={book.title}>
            <Head title={book.title} />
            <PageHeader
                title={book.title}
                description={`Catalogue record by ${book.author}`}
                breadcrumbs={[
                    { label: 'Books', href: route('staff.books.index') },
                    { label: book.title },
                ]}
                actions={
                    <>
                        <Link href={route('staff.books.index')} className="ui-button-secondary">Back to books</Link>
                        <Link href={route('staff.books.edit', book.id)} className="ui-button-primary">Edit book</Link>
                    </>
                }
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]">
                <section className="ui-panel" aria-labelledby="book-details">
                    <div className="ui-panel-header">
                        <h2 id="book-details" className="ui-panel-title">Book details</h2>
                    </div>
                    <dl className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
                        <DetailItem label="Title">{book.title}</DetailItem>
                        <DetailItem label="Author">{book.author}</DetailItem>
                        <DetailItem label="ISBN"><span className="font-mono text-[13px]">{book.isbn}</span></DetailItem>
                        <DetailItem label="Total copies"><span className="tabular-nums">{book.total_copies}</span></DetailItem>
                        <div className="sm:col-span-2">
                            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</dt>
                            <dd className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{book.description || 'No description has been added for this book.'}</dd>
                        </div>
                    </dl>
                </section>

                <div className="grid content-start gap-6">
                    <section className="ui-panel p-5" aria-labelledby="record-history">
                        <h2 id="record-history" className="ui-panel-title">Record history</h2>
                        <dl className="mt-5 grid gap-5">
                            <DetailItem label="Created">{formatDate(book.created_at)}</DetailItem>
                            <DetailItem label="Last updated">{formatDate(book.updated_at)}</DetailItem>
                        </dl>
                    </section>
                </div>
            </div>
        </StaffLayout>
    );
}
