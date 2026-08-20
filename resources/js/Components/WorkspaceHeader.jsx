import AccountMenu from '@/Components/AccountMenu';

export default function WorkspaceHeader({ accountLabel, eyebrow, onMenuClick, title }) {
    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="ui-icon-button lg:hidden"
                    aria-label="Open navigation"
                >
                    <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                </button>

                <div className="min-w-0">
                    <p className="hidden text-[0.625rem] font-bold uppercase tracking-[0.16em] text-teal-700 sm:block">
                        {eyebrow}
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
                </div>

                <div className="ml-auto flex items-center">
                    <AccountMenu label={accountLabel} />
                </div>
            </div>
        </header>
    );
}
