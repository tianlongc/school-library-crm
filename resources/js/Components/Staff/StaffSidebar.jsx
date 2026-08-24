import { Link, usePage } from '@inertiajs/react';

const navigation = [
    { name: 'Dashboard', routeName: 'staff.dashboard', icon: 'dashboard' },
    { name: 'Books', routeName: 'staff.books.index', active: 'staff.books.*', icon: 'books' },
];

const plannedWorkflows = ['Members', 'Loans', 'Returns'];

function NavigationIcon({ name }) {
    const paths = {
        dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
        books: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
        admin: <><path d="m10 17-5-5 5-5" /><path d="M5 12h14" /></>,
        members: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
        loans: <><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" /><path d="M12 17 21 8M15 8h6v6" /></>,
        returns: <><path d="m9 14-4-4 4-4" /><path d="M5 10h11a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4h-3" /></>,
        categories: <><path d="M20 13 11 22l-9-9V2h11l9 9-2 2Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
        settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.39.25.73.6 1 .99.23.34.37.75.4 1.16V13a1.7 1.7 0 0 0-1.4 2Z" /></>,
        logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></>,
    };

    return (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
            {paths[name]}
        </svg>
    );
}

function NavigationItem({ item, onNavigate }) {
    const active = route().current(item.active ?? item.routeName);

    return (
        <Link
            href={route(item.routeName)}
            onClick={onNavigate}
            className={`group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 ${active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'}`}
            aria-current={active ? 'page' : undefined}
        >
            {active && <span className="absolute -left-1 h-5 w-0.5 rounded-full bg-amber-400" />}
            <NavigationIcon name={item.icon} />
            <span>{item.name}</span>
        </Link>
    );
}

export default function StaffSidebar({ onNavigate }) {
    const { auth } = usePage().props;
    const settingsActive = route().current('profile.*');

    return (
        <div className="flex h-full flex-col bg-[#14242e] text-white">
            <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
                <div className="library-mark">
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-semibold tracking-wide">School Library</p>
                    <p className="text-xs text-slate-400">Librarian workspace</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Primary navigation">
                {auth.can.viewAdminDashboard && (
                    <div className="mb-4 border-b border-white/10 pb-4">
                        <Link
                            href={route('admin.dashboard')}
                            onClick={onNavigate}
                            className="flex min-h-11 items-center gap-3 rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 text-sm font-semibold text-amber-100 transition-colors duration-150 hover:border-amber-300/40 hover:bg-amber-300/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
                            prefetch
                        >
                            <NavigationIcon name="admin" />
                            <span>Back to Admin</span>
                        </Link>
                    </div>
                )}

                {navigation.map((item) => (
                    <NavigationItem key={item.name} item={item} onNavigate={onNavigate} />
                ))}

                <div className="mx-2 mt-6 rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-400">Planned workflows</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{plannedWorkflows.join(' · ')}</p>
                </div>
            </nav>

            <div className="space-y-1 border-t border-white/10 p-3">
                <Link
                    href={route('profile.edit')}
                    onClick={onNavigate}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 ${settingsActive ? 'bg-white/10 text-white' : 'text-slate-300'}`}
                    aria-current={settingsActive ? 'page' : undefined}
                >
                    <NavigationIcon name="settings" />
                    Settings
                </Link>
                <Link href={route('logout')} method="post" as="button" className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-300 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300">
                    <NavigationIcon name="logout" />
                    Log out
                </Link>
            </div>
        </div>
    );
}
