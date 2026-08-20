export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `ui-button-secondary ${disabled ? 'cursor-not-allowed opacity-50' : ''} ` +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
