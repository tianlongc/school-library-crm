import PageHeader from '@/Components/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

const accessSurfaces = [
    {
        name: 'Student',
        status: 'Live',
        description: 'A focused account home. Catalogue and borrowing services remain planned.',
    },
    {
        name: 'Librarian',
        status: 'Live',
        description: 'The operational workspace for maintaining the Books catalogue.',
    },
    {
        name: 'Administrator',
        status: 'Live',
        description: 'This oversight surface, with access to current Staff operations.',
    },
];

const plannedModules = ['User and role management', 'Circulation reporting', 'Library configuration'];

export default function Dashboard() {
    return (
        <AdminLayout title="Overview">
            <Head title="Admin dashboard" />

            <PageHeader
                eyebrow="Administration"
                title="Workspace overview"
                description="Review the current role boundaries and move into Staff operations for live catalogue work."
                actions={(
                    <Link href={route('staff.dashboard')} className="ui-button-primary" prefetch>
                        Open Staff operations
                        <span aria-hidden="true">&rarr;</span>
                    </Link>
                )}
            />

            <section className="mt-8" aria-labelledby="access-ledger-title">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="ui-page-eyebrow">Access ledger</p>
                        <h2 id="access-ledger-title" className="font-serif text-2xl font-semibold tracking-tight text-[var(--library-ink)]">
                            Current workspace boundaries
                        </h2>
                    </div>
                    <p className="max-w-md text-sm leading-6 text-slate-500">
                        Permissions protect the routes; these cards explain the experience each role receives.
                    </p>
                </div>

                <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-[var(--library-line)] bg-[var(--library-line)] lg:grid-cols-3">
                    {accessSurfaces.map((surface, index) => (
                        <article key={surface.name} className="relative bg-white p-6 sm:p-7">
                            <div className="flex items-center justify-between gap-4">
                                <span className="font-mono text-xs font-bold text-amber-700">0{index + 1}</span>
                                <span className="ui-badge ui-badge-success">{surface.status}</span>
                            </div>
                            <h3 className="mt-10 font-serif text-2xl font-semibold text-[var(--library-ink)]">{surface.name}</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{surface.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mt-8 grid gap-6 rounded-2xl border border-[var(--library-line)] bg-white p-6 shadow-sm lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:p-8" aria-labelledby="admin-roadmap-title">
                <div>
                    <p className="ui-page-eyebrow">Backend required</p>
                    <h2 id="admin-roadmap-title" className="font-serif text-2xl font-semibold tracking-tight text-[var(--library-ink)]">
                        Next administration modules
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                        These remain visible as a roadmap, not clickable controls, until their routes and data contracts exist.
                    </p>
                </div>

                <ul className="grid gap-3">
                    {plannedModules.map((module) => (
                        <li key={module} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5">
                            <span className="text-sm font-semibold text-slate-700">{module}</span>
                            <span className="ui-planned-chip">Planned</span>
                        </li>
                    ))}
                </ul>
            </section>
        </AdminLayout>
    );
}
