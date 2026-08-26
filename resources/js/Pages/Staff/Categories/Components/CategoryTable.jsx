import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import { Link } from '@inertiajs/react';

function CategoryActions({ category, onDelete, className = '' }) {
    return (
        <div className={`flex items-center justify-center gap-1 ${className}`} role="group" aria-label={`Actions for ${category.name}`}>
            <Link
                href={route('staff.categories.edit', category.id)}
                className="ui-icon-button h-9 w-9 text-teal-700 hover:bg-teal-50 hover:text-teal-900"
                aria-label={`Edit ${category.name}`}
                title="Edit category"
            >
                <EditOutlined aria-hidden="true" />
            </Link>
            <button
                type="button"
                onClick={() => onDelete(category)}
                className="ui-icon-button h-9 w-9 text-rose-700 hover:bg-rose-50 hover:text-rose-900 focus-visible:outline-rose-700"
                aria-label={`Delete ${category.name}`}
                title="Delete category"
            >
                <DeleteOutlined aria-hidden="true" />
            </button>
        </div>
    );
}

function BookCount({ count }) {
    return (
        <span className="inline-flex min-w-20 items-center justify-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-teal-800 ring-1 ring-inset ring-teal-200">
            {count} {count === 1 ? 'book' : 'books'}
        </span>
    );
}

function EmptyState({ hasSearch }) {
    return (
        <div className="ui-empty-state">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13 11 22l-9-9V2h11l9 9-2 2Z" />
                    <circle cx="7.5" cy="7.5" r="1.5" />
                </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">No categories found</p>
            <p className="mt-1 text-xs text-slate-500">
                {hasSearch
                    ? 'Try a broader category name.'
                    : 'Add the first category to organize the catalogue.'}
            </p>
        </div>
    );
}

export default function CategoryTable({ categories, links, meta, onDelete, search }) {
    if (categories.length === 0) {
        return <EmptyState hasSearch={Boolean(search?.trim())} />;
    }

    return (
        <>
            <div className="grid divide-y divide-slate-200 md:hidden">
                {categories.map((category) => (
                    <article key={category.id} className="p-4">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13 11 22l-9-9V2h11l9 9-2 2Z" />
                                    <circle cx="7.5" cy="7.5" r="1.5" />
                                </svg>
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="break-words text-sm font-semibold text-slate-900">{category.name}</p>
                                <div className="mt-2">
                                    <BookCount count={category.books_count} />
                                </div>
                            </div>
                        </div>
                        <CategoryActions category={category} onDelete={onDelete} className="mt-3 border-t border-slate-100 pt-3" />
                    </article>
                ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
                <table className="ui-table">
                    <thead>
                        <tr>
                            <th className="px-5 py-3.5 sm:px-6">Category</th>
                            <th className="px-5 py-3.5 text-center">Catalogue</th>
                            <th className="px-5 py-3.5 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="px-5 py-4 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                                            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13 11 22l-9-9V2h11l9 9-2 2Z" />
                                                <circle cx="7.5" cy="7.5" r="1.5" />
                                            </svg>
                                        </span>
                                        <span className="break-words text-sm font-semibold text-slate-900">{category.name}</span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-center">
                                    <BookCount count={category.books_count} />
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-center">
                                    <CategoryActions category={category} onDelete={onDelete} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-xs text-slate-500">
                    Page <span className="font-semibold text-slate-700">{meta.current_page}</span> of <span className="font-semibold text-slate-700">{meta.last_page}</span> · {meta.total} categories
                </p>
                <div className="flex gap-2">
                    {links.prev ? (
                        <Link href={links.prev} preserveScroll preserveState className="ui-button-secondary min-h-9 px-3 py-1.5 text-xs">Previous</Link>
                    ) : (
                        <span className="ui-button-secondary min-h-9 cursor-not-allowed px-3 py-1.5 text-xs opacity-45">Previous</span>
                    )}
                    {links.next ? (
                        <Link href={links.next} preserveScroll preserveState className="ui-button-secondary min-h-9 px-3 py-1.5 text-xs">Next</Link>
                    ) : (
                        <span className="ui-button-secondary min-h-9 cursor-not-allowed px-3 py-1.5 text-xs opacity-45">Next</span>
                    )}
                </div>
            </div>
        </>
    );
}
