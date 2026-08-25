import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { Head, Link } from '@inertiajs/react';

const plannedWorkflows = [
    { name: 'Members', detail: 'Member accounts & borrowing eligibility' },
    { name: 'Circulation', detail: 'Issue, renew & return books' },
    { name: 'Reporting', detail: 'Availability, overdue & activity insights' },
];

export default function Dashboard() {
    return (
        <StaffLayout title="Dashboard">
            <Head title="Dashboard" />

            <PageHeader eyebrow="Workspace" title="Library dashboard" description="Start with the live catalogue today. Member and circulation workflows will join this workspace as they are built." />

            <div className="grid gap-6">
                <section className="ui-panel" aria-labelledby="catalogue-workspace">
                    <div className="ui-panel-header">
                        <div>
                            <h2 id="catalogue-workspace" className="ui-panel-title">Catalogue workspace</h2>
                            <p className="ui-panel-description">The active part of your library system</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                            Active
                        </span>
                    </div>

                    <div className="grid min-h-64 gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div className="max-w-2xl">
                            <div className="library-mark mb-5">
                                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>
                            </div>
                            <h3 className="text-balance text-xl font-semibold tracking-tight text-slate-950">Keep every title findable and ready for circulation.</h3>
                            <p className="mt-2 text-pretty text-sm leading-6 text-slate-600">Create catalogue records, search by title, author or ISBN, and maintain copy counts from one focused workspace.</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Link href={route('staff.books.index')} className="ui-button-secondary">Browse books</Link>
                            <Link href={route('staff.books.create')} className="ui-button-primary">Add book</Link>
                        </div>
                    </div>
                </section>

                <aside className="ui-panel" aria-labelledby="planned-workflows">
                    <div className="ui-panel-header">
                        <div>
                            <h2 id="planned-workflows" className="ui-panel-title">Next workflows</h2>
                            <p className="ui-panel-description">Planned additions to this workspace</p>
                        </div>
                    </div>
                    <ol className="grid divide-y divide-slate-100 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
                        {plannedWorkflows.map((workflow, index) => (
                            <li key={workflow.name} className="flex gap-3 py-4 sm:px-5 sm:first:pl-0 sm:last:pr-0">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold tabular-nums text-slate-600">{index + 1}</span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{workflow.name}</p>
                                    <p className="mt-0.5 text-xs leading-5 text-slate-500">{workflow.detail}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </aside>
            </div>
        </StaffLayout>
    );
}
