import AccountMenu from '@/Components/AccountMenu';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

function StudentNavigationLink({ children, href, active }) {
    return (
        <Link
            href={href}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                active
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
            aria-current={active ? 'page' : undefined}
            prefetch
        >
            {children}
        </Link>
    );
}

export default function StudentLayout({ children }) {
    return (
        <div className="ui-shell">
            <a href="#main-content" className="ui-skip-link">
                Skip to main content
            </a>

            <header className="border-b border-[var(--library-line)] bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
                    <Link
                        href={route('student.dashboard')}
                        className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                        aria-label="Student library home"
                        prefetch
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
                            <ApplicationLogo className="h-5 w-5" />
                        </span>
                        <span className="hidden sm:block">
                            <span className="block font-serif text-base font-semibold leading-none text-[var(--library-ink)]">
                                School Library
                            </span>
                            <span className="mt-1 block text-[0.625rem] font-bold uppercase tracking-[0.16em] text-slate-500">
                                Student desk
                            </span>
                        </span>
                    </Link>

                    <nav className="ml-1 flex items-center gap-1 sm:ml-5" aria-label="Student navigation">
                        <StudentNavigationLink
                            href={route('student.dashboard')}
                            active={route().current('student.dashboard')}
                        >
                            Home
                        </StudentNavigationLink>
                        <StudentNavigationLink
                            href={route('profile.edit')}
                            active={route().current('profile.*')}
                        >
                            Account
                        </StudentNavigationLink>
                    </nav>

                    <div className="ml-auto">
                        <AccountMenu label="Student account" />
                    </div>
                </div>
            </header>

            <main id="main-content" tabIndex="-1" className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="mx-auto max-w-7xl">{children}</div>
            </main>
        </div>
    );
}
