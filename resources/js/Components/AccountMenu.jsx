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

export default function AccountMenu({ label = 'Library account' }) {
    const { auth } = usePage().props;

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg p-1.5 text-left transition-colors duration-150 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    aria-label="Open account menu"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--library-ink)] text-xs font-semibold text-white">
                        {initials(auth.user.name)}
                    </span>
                    <span className="hidden min-w-0 md:block">
                        <span className="block max-w-32 truncate text-sm font-semibold text-slate-800">
                            {auth.user.name}
                        </span>
                        <span className="block text-xs text-slate-500">{label}</span>
                    </span>
                    <svg
                        aria-hidden="true"
                        className="hidden h-4 w-4 text-slate-400 md:block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8 10 4 4 4-4" />
                    </svg>
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content align="right" width="48">
                <Dropdown.Link href={route('profile.edit')}>Account settings</Dropdown.Link>
                <Dropdown.Link href={route('logout')} method="post" as="button">
                    Log out
                </Dropdown.Link>
            </Dropdown.Content>
        </Dropdown>
    );
}
