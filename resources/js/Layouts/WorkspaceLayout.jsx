import WorkspaceHeader from '@/Components/WorkspaceHeader';
import { useEffect, useState } from 'react';

export default function WorkspaceLayout({
    accountLabel,
    children,
    eyebrow,
    Sidebar,
    title,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [sidebarOpen]);

    return (
        <div className="ui-shell">
            <a href="#main-content" className="ui-skip-link">
                Skip to main content
            </a>

            <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
                <Sidebar />
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close navigation"
                    />
                    <aside className="relative h-full w-[min(18rem,88vw)] overscroll-contain shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="absolute right-3 top-5 z-10 ui-icon-button text-slate-300 hover:bg-white/10 hover:text-white"
                            aria-label="Close navigation"
                        >
                            <svg
                                aria-hidden="true"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
                            </svg>
                        </button>
                        <Sidebar onNavigate={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="lg:pl-72">
                <WorkspaceHeader
                    accountLabel={accountLabel}
                    eyebrow={eyebrow}
                    title={title}
                    onMenuClick={() => setSidebarOpen(true)}
                />
                <main id="main-content" tabIndex="-1" className="ui-main">
                    <div className="ui-main-inner">{children}</div>
                </main>
            </div>
        </div>
    );
}
