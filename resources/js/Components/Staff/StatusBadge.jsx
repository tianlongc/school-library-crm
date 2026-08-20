export default function StatusBadge({ status }) {
    const normalizedStatus = status?.toLowerCase() ?? 'not tracked';
    const styles = {
        available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        'low stock': 'bg-amber-50 text-amber-700 ring-amber-600/20',
        unavailable: 'bg-rose-50 text-rose-700 ring-rose-600/20',
        'not tracked': 'bg-slate-100 text-slate-600 ring-slate-500/20',
        borrowed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        overdue: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[normalizedStatus] ?? styles['not tracked']}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {status ?? 'Not tracked'}
        </span>
    );
}
