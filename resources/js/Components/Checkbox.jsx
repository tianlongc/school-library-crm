export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-slate-300 text-teal-700 shadow-sm focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 ' +
                className
            }
        />
    );
}
