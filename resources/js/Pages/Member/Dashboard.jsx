import MemberLayout from '@/Layouts/MemberLayout';
import { Head, Link, usePage } from '@inertiajs/react';

const plannedServices = [
    'Search the school catalogue',
    'See current loans and due dates',
    'Follow availability and borrowing status',
];

export default function Dashboard() {
    const { auth, member } = usePage().props;

    return (
        <MemberLayout>
            <Head title="Member Dashboard" />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)] lg:items-start">
                <section aria-labelledby="member-welcome">
                    <p className="ui-page-eyebrow">Your library account</p>
                    <h1 id="member-welcome" className="max-w-3xl font-serif text-4xl font-semibold tracking-[-0.04em] text-[var(--library-ink)] sm:text-5xl">
                        Welcome, {auth.user.name}.
                    </h1>
                    <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-600">
                        Your member account is ready. Catalogue discovery and borrowing tools will appear here as those library services are connected.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href={route('profile.edit')} className="ui-button-primary" prefetch>
                            Review account details
                        </Link>
                        <Link href="/" className="ui-button-secondary" prefetch>
                            Library home
                        </Link>
                    </div>
                </section>

                <aside className="overflow-hidden rounded-2xl bg-[var(--library-ink)] text-white shadow-[0_22px_60px_rgb(20_36_46_/_0.18)]" aria-labelledby="library-card-title">
                    <div className="h-2 bg-amber-400" />
                    <div className="p-6 sm:p-7">
                        <div className="flex items-start justify-between gap-5">
                            <div>
                                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-teal-300">
                                    Digital library card
                                </p>
                                <h2 id="library-card-title" className="mt-2 font-serif text-2xl font-semibold">
                                    Library member
                                </h2>
                            </div>
                            <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-inset ring-emerald-300/25">
                                Signed in
                            </span>
                        </div>

                        <dl className="mt-8 grid gap-5 border-t border-white/15 pt-6">
                            <div>
                                <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-slate-400">Member Number</dt>
                                <dd className="mt-1 text-sm font-semibold text-white">{member.member_number}</dd>
                            </div>
                            <div>
                                <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-slate-400">Status</dt>
                                <dd className="mt-1 break-all text-sm font-semibold text-white">{member.status}</dd>
                            </div>
                        </dl>
                    </div>
                </aside>
            </div>

            <section className="mt-12 border-t border-[var(--library-line)] pt-8" aria-labelledby="member-services-title">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
                    <div>
                        <p className="ui-page-eyebrow">Next connection</p>
                        <h2 id="member-services-title" className="font-serif text-2xl font-semibold tracking-tight text-[var(--library-ink)]">
                            Member library services
                        </h2>
                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                            These experiences need catalogue and circulation endpoints before they become interactive.
                        </p>
                    </div>

                    <ol className="grid gap-px overflow-hidden rounded-2xl border border-[var(--library-line)] bg-[var(--library-line)] sm:grid-cols-3">
                        {plannedServices.map((service, index) => (
                            <li key={service} className="bg-white p-5">
                                <span className="text-xs font-bold tabular-nums text-amber-700">0{index + 1}</span>
                                <p className="mt-5 text-sm font-semibold leading-6 text-slate-800">{service}</p>
                                <span className="ui-planned-chip mt-4">Planned</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </MemberLayout>
    );
}
