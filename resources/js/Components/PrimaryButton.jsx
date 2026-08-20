export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `ui-button-primary ${disabled ? 'cursor-not-allowed opacity-50' : ''} ` +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
