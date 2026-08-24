import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { Head, Link, router } from '@inertiajs/react';
import { App as AntdApp } from 'antd';
import { useState } from 'react';
import CategoryTable from './Components/CategoryTable';

export default function Index({ categories, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const { message, modal } = AntdApp.useApp();

    const submitSearch = (event) => {
        event.preventDefault();
        const normalizedSearch = search.trim();

        router.get(
            route('staff.categories.index'),
            normalizedSearch ? { search: normalizedSearch } : {},
            { preserveState: true, replace: true },
        );
    };

    const confirmDelete = (category) => {
        modal.confirm({
            title: 'Delete category?',
            content: `Delete “${category.name}”? Its books will stay in the catalogue and become uncategorized.`,
            okText: 'Delete category',
            cancelText: 'Keep category',
            okButtonProps: { danger: true },
            async onOk() {
                try {
                    await jsonRequest({
                        url: route('staff.categories.destroy', category.id),
                        method: 'DELETE',
                    });

                    message.success('Category deleted.');
                    router.reload({ only: ['categories'] });
                } catch (error) {
                    message.error(
                        getRequestErrorMessage(
                            error,
                            'The category could not be deleted. Try again.',
                        ),
                    );

                    throw error;
                }
            },
        });
    };

    return (
        <StaffLayout title="Categories">
            <Head title="Categories" />
            <PageHeader
                eyebrow="Classification"
                title="Categories"
                description="Keep the catalogue organized with clear, reusable subject labels."
                actions={(
                    <Link href={route('staff.categories.create')} className="ui-button-primary">
                        <span aria-hidden="true" className="text-lg leading-none">+</span>
                        Add category
                    </Link>
                )}
            />

            <section className="ui-panel" aria-labelledby="category-directory">
                <div className="border-b border-slate-200 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 id="category-directory" className="text-sm font-semibold text-slate-900">Category directory</h2>
                            <p className="mt-1 text-xs text-slate-500">{categories.meta.total} {categories.meta.total === 1 ? 'category' : 'categories'} in the catalogue</p>
                        </div>
                        <form onSubmit={submitSearch} className="relative w-full sm:max-w-md" role="search">
                            <label htmlFor="category-search" className="sr-only">Search categories</label>
                            <svg aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="7" />
                                <path strokeLinecap="round" d="m20 20-3.5-3.5" />
                            </svg>
                            <input
                                id="category-search"
                                name="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="ui-input pl-10 pr-20"
                                placeholder="Search category name…"
                                autoComplete="off"
                            />
                            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1.5 text-xs font-semibold text-teal-700 transition-colors duration-150 hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700">
                                Search
                            </button>
                        </form>
                    </div>
                </div>

                <CategoryTable
                    categories={categories.data}
                    links={categories.links}
                    meta={categories.meta}
                    onDelete={confirmDelete}
                    search={filters.search}
                />
            </section>
        </StaffLayout>
    );
}
