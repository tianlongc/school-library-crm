import Dropdown from '@/Components/Dropdown';
import { usePage } from '@inertiajs/react';

function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

export default function AdminHeader({ onMenuClick, title }) {
    const { auth } = usePage().props;

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
                <button type="button" onClick={onMenuClick} className="ui-icon-button lg:hidden" aria-label="Open navigation">
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
                </button>

                <div className="min-w-0">
                    <p className="hidden text-[0.625rem] font-bold uppercase tracking-[0.16em] text-teal-700 sm:block">
                        Workspace
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
                </div>

                <div className="ml-auto flex items-center">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button type="button" className="flex items-center gap-2 rounded-lg p-1.5 text-left transition-colors duration-150 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" aria-label="Open account menu">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#14242e] text-xs font-semibold text-white">{initials(auth.user.name)}</span>
                                <span className="hidden min-w-0 md:block">
                                    <span className="block max-w-32 truncate text-sm font-semibold text-slate-800">{auth.user.name}</span>
                                    <span className="block text-xs text-slate-500">Library account</span>
                                </span>
                                <svg aria-hidden="true" className="hidden h-4 w-4 text-slate-400 md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m8 10 4 4 4-4" /></svg>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content align="right" width="48">
                            <Dropdown.Link href={route('profile.edit')}>Account settings</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">Log out</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}
