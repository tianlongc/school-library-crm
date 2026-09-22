import ApplicationLogo from '@/Components/ApplicationLogo';
import InertiaButton from '@/Components/InertiaButton';
import WelcomeFeatureMarquee from '@/Components/WelcomeFeatureMarquee';
import { Head, Link } from '@inertiajs/react';

const workflowItems = [
    {
        title: 'Start with a clear path',
        description: 'Give every reader a simple way to begin and stay oriented.',
    },
    {
        title: 'Keep the school day moving',
        description: 'Bring the work of the library into one calm, shared rhythm.',
    },
    {
        title: 'Support the whole school',
        description: 'Help library teams and school leaders make better decisions.',
    },
];

const audienceRoles = [
    {
        number: '01',
        title: 'Students',
        description: 'Find a clear way into the library and the next thing they want to read.',
    },
    {
        number: '02',
        title: 'Librarians',
        description: 'Keep daily work coordinated, dependable, and easy to follow.',
    },
    {
        number: '03',
        title: 'Administrators',
        description: 'Stay connected to the bigger picture without adding more noise.',
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
                        <h2 className="welcome-workflow-title">Keep the next step clear.</h2>
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
                    <span>One shared place</span>
                    <span>Less friction</span>
                    <span>More reading</span>
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
                    content="A clear, connected workspace for students, librarians, and administrators."
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
                                A clear, connected way to help students find their next read
                                and help library teams keep the school day moving.
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
                            <p className="ui-eyebrow">A calmer way to work</p>
                            <h2 id="workflow-title">
                                The right information, at the right moment.
                            </h2>
                            <p>
                                Bring the daily rhythm of the school library into one clear
                                experience that feels useful from the first visit.
                            </p>
                        </div>

                        <div className="welcome-workflow-summary" aria-hidden="true">
                            <span className="welcome-summary-line" />
                            <span>Shared by the whole school</span>
                        </div>
                    </section>

                    <section
                        id="audiences"
                        className="welcome-audience-section"
                        aria-labelledby="audiences-title"
                    >
                        <div className="welcome-audience-heading">
                            <p className="ui-eyebrow">Built around people</p>
                            <h2 id="audiences-title">One shared system, three perspectives.</h2>
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
                    <p>Built for curious minds and capable library teams.</p>
                    <p>&copy; {new Date().getFullYear()} School Library CRM</p>
                </footer>
            </div>
        </>
    );
}
