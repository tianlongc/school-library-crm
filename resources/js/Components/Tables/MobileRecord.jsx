export default function MobileRecord({ title, subtitle, status, details = [], actions }) {
    return (
        <article className="mobile-directory-record">
            <div className="mobile-directory-heading">
                <div className="mobile-directory-title">
                    <div className="mobile-directory-name">{title}</div>
                    {subtitle && <div className="mobile-directory-subtitle">{subtitle}</div>}
                </div>
                {status && <div className="mobile-directory-status">{status}</div>}
            </div>
            {details.length > 0 && (
                <dl className="mobile-directory-details">
                    {details.map(({ label, value }) => (
                        <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value ?? '—'}</dd>
                        </div>
                    ))}
                </dl>
            )}
            {actions && <div className="mobile-directory-actions">{actions}</div>}
        </article>
    );
}
