export default function StatCard({ label, value, helper, icon, tone = 'teal' }) {
    const tones = {
        teal: 'border-teal-600 bg-teal-50 text-teal-700',
        blue: 'border-blue-600 bg-blue-50 text-blue-700',
        amber: 'border-amber-500 bg-amber-50 text-amber-700',
        slate: 'border-slate-500 bg-slate-100 text-slate-700',
    };

    return (
        <div className="ui-panel relative p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-600">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 tabular-nums">{value}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg border-l-2 ${tones[tone]}`}>{icon}</span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-5 text-slate-500">{helper}</p>
        </div>
    );
}
