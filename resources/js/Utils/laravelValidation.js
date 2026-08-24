import { JsonRequestError } from "./jsonRequest";

export function getLaravelValidationErrors(error) {
    if (!(error instanceof JsonRequestError) || error.status !== 422) {
        return null;
    }

    const validationErrors = Object.fromEntries(
        Object.entries(error.errors).map(([field, messages]) => [
            field,
            Array.isArray(messages) ? messages[0] : messages,
        ]),
    );

    return Object.keys(validationErrors).length > 0 ? validationErrors : null;
}