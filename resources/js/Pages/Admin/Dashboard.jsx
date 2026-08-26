import PageHeader from '@/Components/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

const plannedCapabilities = [
    {
        name: 'Account directory',
        description: 'Find school library accounts and review their current access.',
    },
    {
        name: 'Role assignment',
        description: 'Assign student, librarian, and administrator responsibilities.',
    },
    {
        name: 'Access review',
        description: 'Confirm who can use protected library workflows.',
    },
];

export default function Dashboard() {
    return (
        <AdminLayout title="User management">
            <Head title="User management" />

            <PageHeader
                eyebrow="Administration"
                title="User management"
                description="Administrative account controls live alongside the rest of the library workspace."
            />

            <section className="ui-panel" aria-labelledby="user-management-title">
                <div className="ui-panel-header">
                    <div>
                        <h2 id="user-management-title" className="ui-panel-title">Account administration</h2>
                        <p className="ui-panel-description">This module is visible only to administrators.</p>
                    </div>
                    <span className="ui-planned-chip">Planned</span>
                </div>

                <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
                    {plannedCapabilities.map((capability) => (
                        <article key={capability.name} className="bg-white p-5 sm:p-6">
                            <h3 className="text-sm font-semibold text-slate-900">{capability.name}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{capability.description}</p>
                        </article>
                    ))}
                </div>
            </section>
        </AdminLayout>
    );
}
