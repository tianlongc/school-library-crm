import { Link } from '@inertiajs/react';

export default function PageHeader({ title, description, eyebrow, breadcrumbs = [], actions }) {
    return (
        <div className="ui-page-header">
            <div className="min-w-0">
                {breadcrumbs.length > 0 && (
                    <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
                        {breadcrumbs.map((item, index) => (
                            <span key={item.label} className="flex items-center gap-2">
                                {index > 0 && <span aria-hidden="true" className="text-slate-300">/</span>}
                                {item.href ? <Link href={item.href} className="ui-action-link">{item.label}</Link> : <span className="max-w-64 truncate" aria-current="page">{item.label}</span>}
                            </span>
                        ))}
                    </nav>
                )}
                {eyebrow && <p className="ui-page-eyebrow">{eyebrow}</p>}
                <div className="flex items-start gap-3">
                    <span className="library-rule mt-1" aria-hidden="true" />
                    <div className="min-w-0">
                        <h1 className="ui-page-title break-words">{title}</h1>
                        {description && <p className="ui-page-description">{description}</p>}
                    </div>
                </div>
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
