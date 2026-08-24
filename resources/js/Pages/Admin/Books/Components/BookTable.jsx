import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { Link } from '@inertiajs/react';

function BookActions({ book, onDelete, className = '' }) {
    return (
        <div className={`flex flex-wrap items-center justify-center gap-1 ${className}`} role="group" aria-label={`Actions for ${book.title}`}>
            <Link
                href={route('admin.books.show', book.id)}
                className="ui-icon-button h-9 w-9 text-slate-600"
                aria-label={`View ${book.title}`}
                title="View book"
            >
                <EyeOutlined aria-hidden="true" />
            </Link>
            <Link
                href={route('admin.books.edit', book.id)}
                className="ui-icon-button h-9 w-9 text-teal-700 hover:bg-teal-50 hover:text-teal-900"
                aria-label={`Edit ${book.title}`}
                title="Edit book"
            >
                <EditOutlined aria-hidden="true" />
            </Link>
            <button
                type="button"
                onClick={() => onDelete(book)}
                className="ui-icon-button h-9 w-9 text-rose-700 hover:bg-rose-50 hover:text-rose-900 focus-visible:outline-rose-700"
                aria-label={`Delete ${book.title}`}
                title="Delete book"
            >
                <DeleteOutlined aria-hidden="true" />
            </button>
        </div>
    );
}

function EmptyState({ hasSearch }) {
    return (
        <div className="ui-empty-state">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">No books found</p>
            <p className="mt-1 text-xs text-slate-500">
                {hasSearch
                    ? 'Try another title, author, or ISBN.'
                    : 'Add your first book to begin the catalogue.'}
            </p>
        </div>
    );
}

export default function BookTable({ books, search, meta, links, onDelete }) {
    if (books.length === 0) {
        return <EmptyState hasSearch={Boolean(search?.trim())} />;
    }

    return (
        <>
            <div className="grid divide-y divide-slate-200 md:hidden">
                {books.map((book) => (
                    <article key={book.id} className="p-4">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-10 w-9 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>
                            </span>
                            <div className="min-w-0 flex-1">
                                <Link href={route('admin.books.show', book.id)} className="ui-action-link line-clamp-2">{book.title}</Link>
                                <p className="mt-0.5 truncate text-xs text-slate-500">{book.author}</p>
                            </div>
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                            <div><dt className="text-slate-500">ISBN</dt><dd className="mt-1 font-mono text-slate-800">{book.isbn}</dd></div>
                            <div><dt className="text-slate-500">Copies</dt><dd className="mt-1 font-semibold text-slate-800">{book.total_copies} total</dd></div>
                        </dl>
                        <BookActions book={book} onDelete={onDelete} className="mt-3" />
                    </article>
                ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th className="px-5 py-3.5 sm:px-6">Book</th>
                            <th className="px-5 py-3.5">Author</th>
                            <th className="px-5 py-3.5">ISBN</th>
                            <th className="px-5 py-3.5 text-center">Total copies</th>
                            <th className="px-5 py-3.5 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book) => (
                            <tr key={book.id}>
                                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-9 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                                            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>
                                        </span>
                                        <div className="min-w-0 max-w-xs"><Link href={route('admin.books.show', book.id)} className="ui-action-link block truncate text-sm">{book.title}</Link></div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{book.author}</td>
                                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-600">{book.isbn}</td>
                                <td className="whitespace-nowrap px-5 py-4 text-center text-sm font-semibold tabular-nums text-slate-800">{book.total_copies}</td>
                                <td className="whitespace-nowrap px-5 py-4 text-center"><BookActions book={book} onDelete={onDelete} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-xs text-slate-500">Page <span className="font-semibold text-slate-700">{meta.current_page}</span> of <span className="font-semibold text-slate-700">{meta.last_page}</span> · {meta.total} books</p>
                <div className="flex gap-2">
                    {links.prev ? <Link href={links.prev} preserveScroll preserveState className="ui-button-secondary min-h-9 px-3 py-1.5 text-xs">Previous</Link> : <span className="ui-button-secondary min-h-9 cursor-not-allowed px-3 py-1.5 text-xs opacity-45">Previous</span>}
                    {links.next ? <Link href={links.next} preserveScroll preserveState className="ui-button-secondary min-h-9 px-3 py-1.5 text-xs">Next</Link> : <span className="ui-button-secondary min-h-9 cursor-not-allowed px-3 py-1.5 text-xs opacity-45">Next</span>}
                </div>
            </div>
        </>
    );
}
