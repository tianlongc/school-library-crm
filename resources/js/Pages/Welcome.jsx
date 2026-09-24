import ApplicationLogo from '@/Components/ApplicationLogo';
import InertiaButton from '@/Components/InertiaButton';
import WelcomeFeatureMarquee from '@/Components/WelcomeFeatureMarquee';
import { Head, Link } from '@inertiajs/react';

const workflowItems = [
    {
        title: 'Find a book',
        description: 'Search the catalogue and check which copies are available.',
    },
    {
        title: 'Track a loan',
        description: 'See due dates and request a return from your account.',
    },
    {
        title: 'Run the library desk',
        description: 'Issue books and review overdue loans and return requests.',
    },
];

const audienceRoles = [
    {
        number: '01',
        title: 'Students',
        description: 'Browse books, check due dates, and request returns.',
    },
    {
        number: '02',
        title: 'Librarians',
        description: 'Manage the catalogue, issue loans, and handle returns.',
    },
    {
        number: '03',
        title: 'Administrators',
        description: 'Manage user access and publish the member homepage.',
    },
];

function Brand() {
    return (
        <Link
            href="/"
            className="guest-wordmark welcome-wordmark"
            aria-label="School Library home"
            prefetch
        >
            <span className="welcome-brand-mark">
                <ApplicationLogo className="h-6 w-6" />
            </span>
            <span>
                <span className="welcome-brand-name">School Library CRM</span>
                <span className="welcome-brand-label">A shared school workspace</span>
            </span>
        </Link>
    );
}

function WorkflowVisual() {
    return (
        <div className="welcome-workflow-visual">
            <div className="welcome-workflow-backplate" aria-hidden="true" />
            <div className="welcome-workflow-card">
                <div className="welcome-workflow-card-header">
                    <div>
                        <p className="welcome-workflow-kicker">Shared workflow</p>
                        <h2 className="welcome-workflow-title">From catalogue to return.</h2>
                    </div>
                    <span className="welcome-workflow-note">Designed for the school day</span>
                </div>

                <ol className="welcome-workflow-list" aria-label="School library workflow">
                    {workflowItems.map((item, index) => (
                        <li key={item.title} className="welcome-workflow-item">
                            <span className="welcome-workflow-step-number" aria-hidden="true">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        </li>
                    ))}
                </ol>

                <div className="welcome-workflow-footer">
                    <span>Catalogue</span>
                    <span>Loans</span>
                    <span>Returns</span>
                </div>
            </div>
        </div>
    );
}

export default function Welcome({ auth, canRegister }) {
    const isAuthenticated = Boolean(auth.user);
    const primaryAction = isAuthenticated
        ? route('dashboard')
        : route('login');

    return (
        <>
            <Head>
                <title>School Library CRM</title>
                <meta
                    name="description"
                    content="Browse books and manage school library loans in one workspace."
                    head-key="description"
                />
            </Head>

            <div className="welcome-shell">
                <a href="#main-content" className="ui-skip-link">
                    Skip to main content
                </a>

                <header className="welcome-header">
                    <Brand />

                    <nav className="welcome-primary-nav" aria-label="Primary navigation">
                        <a href="#workflow" className="welcome-nav-link">
                            How it works
                        </a>
                        <a href="#audiences" className="welcome-nav-link">
                            For your school
                        </a>
                    </nav>

                    <div className="welcome-header-actions" aria-label="Account actions">
                        {isAuthenticated ? (
                            <InertiaButton href={route('dashboard')} type="primary">
                                Open dashboard
                            </InertiaButton>
                        ) : (
                            <>
                                <InertiaButton
                                    href={route('login')}
                                    type="text"
                                    className="welcome-login-button"
                                >
                                    Sign in
                                </InertiaButton>
                                {canRegister && (
                                    <InertiaButton
                                        href={route('register')}
                                        type="primary"
                                        className="welcome-register-button"
                                    >
                                        Get started
                                    </InertiaButton>
                                )}
                            </>
                        )}
                    </div>
                </header>

                <main id="main-content" tabIndex="-1">
                    <section className="welcome-hero" aria-labelledby="welcome-title">
                        <div className="welcome-hero-copy">
                            <p className="ui-eyebrow">School library workspace</p>
                            <h1 id="welcome-title" className="welcome-title">
                                One library, every reader.
                            </h1>
                            <p className="welcome-lede">
                                Browse the catalogue, see your due dates, and request a return.
                                Library staff can issue books and track loans in the same workspace.
                            </p>

                            <div className="welcome-actions">
                                <InertiaButton
                                    href={primaryAction}
                                    size="large"
                                    type="primary"
                                >
                                    {isAuthenticated
                                        ? 'Open dashboard'
                                        : 'Sign in'}
                                </InertiaButton>
                                {!isAuthenticated && canRegister && (
                                    <InertiaButton
                                        href={route('register')}
                                        size="large"
                                    >
                                        Get started
                                    </InertiaButton>
                                )}
                            </div>

                            <p className="welcome-audience-note">
                                Designed for students, librarians, and administrators.
                            </p>
                        </div>

                        <WorkflowVisual />
                    </section>

                    <WelcomeFeatureMarquee />

                    <section
                        id="workflow"
                        className="welcome-workflow-section"
                        aria-labelledby="workflow-title"
                    >
                        <div className="welcome-section-intro">
                            <p className="ui-eyebrow">Library tasks</p>
                            <h2 id="workflow-title">
                                Books, loans, and returns in view.
                            </h2>
                            <p>
                                Members can check their borrowing status. Staff can act on
                                overdue loans and return requests.
                            </p>
                        </div>

                        <div className="welcome-workflow-summary" aria-hidden="true">
                            <span className="welcome-summary-line" />
                            <span>One account entry for each role</span>
                        </div>
                    </section>

                    <section
                        id="audiences"
                        className="welcome-audience-section"
                        aria-labelledby="audiences-title"
                    >
                        <div className="welcome-audience-heading">
                            <p className="ui-eyebrow">Who uses it</p>
                            <h2 id="audiences-title">A workspace for each library role.</h2>
                        </div>

                        <div className="welcome-audience-grid">
                            {audienceRoles.map((role) => (
                                <article key={role.title} className="welcome-audience-card">
                                    <span className="welcome-audience-number" aria-hidden="true">
                                        {role.number}
                                    </span>
                                    <div className="welcome-audience-card-content">
                                        <h3>{role.title}</h3>
                                        <p>{role.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </main>

                <footer className="welcome-footer">
                    <p>School library catalogue and circulation.</p>
                    <p>&copy; {new Date().getFullYear()} School Library CRM</p>
                </footer>
            </div>
        </>
    );
}
