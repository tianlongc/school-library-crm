export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M24 38.5V12.75C19.75 8.9 13.8 7.85 8.5 10.5V35.75C14.05 33.55 19.8 34.45 24 38.5Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M24 38.5V12.75C28.25 8.9 34.2 7.85 39.5 10.5V35.75C33.95 33.55 28.2 34.45 24 38.5Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15 16.5H19M29 16.5H33"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
