import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({
    children,
    title = 'School Library',
    description = 'Access the collection workspace.',
}) {
    return (
        <div className="guest-shell">
            <a href="#guest-content" className="ui-skip-link">
                Skip to form
            </a>

            <div className="guest-frame">
                <aside className="guest-brand-panel">
                    <Link
                        href="/"
                        className="guest-wordmark w-fit text-white"
                        aria-label="School Library home"
                        prefetch
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
                            <ApplicationLogo className="h-6 w-6" />
                        </span>
                        <span>
                            <span className="block font-serif text-lg font-semibold leading-none">
                                School Library
                            </span>
                            <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/55">
                                Collection desk
                            </span>
                        </span>
                    </Link>

                    <div className="guest-brand-copy">
                        <p className="ui-eyebrow text-amber-300">
                            One school library, one account entry
                        </p>
                        <h2 className="mt-5 max-w-xl font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
                            Find a book. Check your account. Keep the day moving.
                        </h2>
                        <p className="mt-5 max-w-lg text-base leading-7 text-white/65">
                            Students and administrators use the same account flow. What
                            each person can do is determined by their library role.
                        </p>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                        Shared account access
                    </p>
                </aside>

                <main
                    id="guest-content"
                    tabIndex="-1"
                    className="guest-form-panel"
                >
                    <div className="w-full max-w-md">
                        <header className="mb-8">
                            <p className="ui-eyebrow">School library account</p>
                            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.03em] text-[var(--library-ink)]">
                                {title}
                            </h1>
                            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
                                {description}
                            </p>
                        </header>

                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
