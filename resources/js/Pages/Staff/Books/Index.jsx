import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { App as AntdApp } from 'antd';
import BookTable from './Components/BookTable';

export default function Index({ books, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const { message, modal } = AntdApp.useApp();

    const submitSearch = (event) => {
        event.preventDefault();
        router.get(route('staff.books.index'), search.trim() ? { search: search.trim() } : {}, { preserveState: true, replace: true });
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
                actions={<Link href={route('staff.books.create')} className="ui-button-primary"><span aria-hidden="true" className="text-lg leading-none">+</span>Add book</Link>}
            />

            <section className="ui-panel" aria-labelledby="book-catalogue">
                <h2 id="book-catalogue" className="sr-only">Book catalogue</h2>
                <div className="border-b border-slate-200 p-4 sm:p-5">
                    <div className="max-w-2xl">
                        <form onSubmit={submitSearch} className="relative" role="search">
                            <label htmlFor="book-search" className="sr-only">Search books</label>
                            <svg aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m20 20-3.5-3.5" /></svg>
                            <input id="book-search" name="search" value={search} onChange={(event) => setSearch(event.target.value)} className="ui-input pl-10 pr-20" placeholder="Search title, author or ISBN…" autoComplete="off" spellCheck={false} />
                            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-teal-700 transition-colors duration-150 hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700">Search</button>
                        </form>
                    </div>
                </div>

                <BookTable
                    books={books.data}
                    search={filters.search}
                    meta={books.meta}
                    links={books.links}
                    onDelete={confirmDelete}
                />
            </section>

        </StaffLayout>
    );
}
