import { JsonRequestError } from "./jsonRequest";

const statusMessages = {
    401: 'Please sign in again.',
    403: 'You are not allowed to do that.',
    419: 'Your session expired. Refresh the page and try again.',
};

export function getRequestErrorMessage(error, fallback='An unexpected error occurred.') {
    if (!(error instanceof JsonRequestError)) {
        return fallback;
    }

    return statusMessages[error.status] ?? error.message ?? fallback;
}