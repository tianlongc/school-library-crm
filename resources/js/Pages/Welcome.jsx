import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';

const capabilities = [
    {
        label: 'Catalogue',
        title: 'A catalogue everyone can trust',
        description:
            'Search titles, authors, ISBNs, and copy counts without losing your place.',
    },
    {
        label: 'Accounts',
        title: 'One shared account entry point',
        description:
            'Members and library staff use the same secure login and account flow.',
    },
    {
        label: 'Library team',
        title: 'Roles grow with responsibility',
        description:
            'Member accounts register here; staff access is assigned separately by an administrator.',
    },
];

function Brand() {
    return (
        <Link
            href="/"
            className="guest-wordmark"
            aria-label="School Library home"
            prefetch
        >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
                <ApplicationLogo className="h-6 w-6" />
            </span>
            <span>
                <span className="block font-serif text-lg font-semibold leading-none text-[var(--library-ink)]">
                    School Library
                </span>
                <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Collection desk
                </span>
            </span>
        </Link>
    );
}

function CataloguePreview() {
    return (
        <div className="catalogue-stage" aria-hidden="true">
            <div className="catalogue-shadow-card" />
            <div className="catalogue-card">
                <div className="flex items-center justify-between border-b border-[var(--library-line)] pb-5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                            <ApplicationLogo className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Catalogue card
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-[var(--library-ink)]">
                                Record 00418
                            </p>
                        </div>
                    </div>
                    <span className="ui-badge ui-badge-success">Available</span>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-[9rem_1fr]">
                    <div className="book-cover">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                            Fiction
                        </span>
                        <div>
                            <p className="font-serif text-2xl font-semibold leading-tight text-white">
                                The quiet shelf
                            </p>
                            <p className="mt-2 text-sm text-white/70">A. Reader</p>
                        </div>
                        <span className="h-1 w-8 rounded-full bg-amber-300" />
                    </div>

                    <dl className="grid content-start grid-cols-2 gap-3">
                        <div className="catalogue-data-cell col-span-2">
                            <dt>Title</dt>
                            <dd>The quiet shelf</dd>
                        </div>
                        <div className="catalogue-data-cell">
                            <dt>Copies</dt>
                            <dd>4 of 5</dd>
                        </div>
                        <div className="catalogue-data-cell">
                            <dt>Shelf</dt>
                            <dd>FIC 823</dd>
                        </div>
                        <div className="catalogue-data-cell col-span-2">
                            <dt>ISBN</dt>
                            <dd>978-1-4028-9462-6</dd>
                        </div>
                    </dl>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[var(--library-line)] pt-5 text-xs font-medium text-slate-500">
                    <span>Updated just now</span>
                    <span className="text-teal-800">View record &rarr;</span>
                </div>
            </div>
        </div>
    );
}

export default function Welcome({ auth, canRegister }) {
    const isAuthenticated = Boolean(auth.user);

    return (
        <>
            <Head>
                <title>School Library</title>
                <meta
                    name="description"
                    content="A shared school library workspace for members and library staff."
                    head-key="description"
                />
            </Head>

            <div className="welcome-shell">
                <a href="#main-content" className="ui-skip-link">
                    Skip to main content
                </a>

                <header className="welcome-header" aria-label="Primary navigation">
                    <Brand />

                    <nav className="flex items-center gap-2" aria-label="Account">
                        {isAuthenticated ? (
                            <Link
                                href={route('dashboard')}
                                className="ui-button-primary"
                                prefetch
                            >
                                Open dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="ui-button-ghost"
                                    prefetch
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="ui-button-primary hidden sm:inline-flex"
                                        prefetch
                                    >
                                        Create account
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <main id="main-content" tabIndex="-1">
                    <section className="welcome-hero" aria-labelledby="welcome-title">
                        <div className="self-center">
                            <p className="ui-eyebrow">School collection workspace</p>
                            <h1 id="welcome-title" className="welcome-title">
                                Keep every book within reach.
                            </h1>
                            <p className="welcome-lede">
                                A clear, dependable place to explore the school collection,
                                check availability, and keep library services moving.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href={
                                        isAuthenticated
                                            ? route('dashboard')
                                            : route('login')
                                    }
                                    className="ui-button-primary px-5 py-3"
                                    prefetch
                                >
                                    {isAuthenticated
                                        ? 'Open the dashboard'
                                        : 'Continue to log in'}
                                </Link>
                                {!isAuthenticated && canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="ui-button-secondary px-5 py-3"
                                        prefetch
                                    >
                                        Create member account
                                    </Link>
                                )}
                            </div>

                            <ul className="mt-8 grid gap-3 text-sm font-medium text-slate-600 sm:grid-cols-2">
                                <li className="welcome-check">Fast catalogue search</li>
                                <li className="welcome-check">Clear availability states</li>
                            </ul>
                        </div>

                        <CataloguePreview />
                    </section>

                    <section
                        className="welcome-capabilities"
                        aria-labelledby="capabilities-title"
                    >
                        <h2 id="capabilities-title" className="sr-only">
                            Designed for the school library
                        </h2>
                        {capabilities.map((capability) => (
                            <article key={capability.title} className="welcome-capability">
                                <span className="pt-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-amber-700">
                                    {capability.label}
                                </span>
                                <div>
                                    <h3 className="font-serif text-xl font-semibold text-[var(--library-ink)]">
                                        {capability.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {capability.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </section>
                </main>

                <footer className="welcome-footer">
                    <p>Built for quiet, capable library work.</p>
                    <p>&copy; {new Date().getFullYear()} School Library</p>
                </footer>
            </div>
        </>
    );
}
