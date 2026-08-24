export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            role="alert"
            {...props}
            className={'text-sm font-medium text-rose-700 ' + className}
        >
            {message}
        </p>
    ) : null;
}
