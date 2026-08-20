export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `ui-button-danger ${disabled ? 'cursor-not-allowed opacity-50' : ''} ` +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
