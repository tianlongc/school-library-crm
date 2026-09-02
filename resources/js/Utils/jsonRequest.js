import axios from 'axios';

export const apiClient = axios.create({
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    withXSRFToken: true,
});

export class JsonRequestError extends Error {
    constructor(message, { status = null, errors = {}, cause } = {}) {
        super(message, { cause });

        this.name = 'JsonRequestError';
        this.status = status;
        this.errors = errors;
    }
}

export async function jsonRequest(config) {
    try {
        const response = await apiClient.request(config);

        return response.data;
    } catch (cause) {
        if (axios.isCancel(cause)) {
            throw cause;
        }

        if (!axios.isAxiosError(cause)) {
            throw cause;
        }

        const status = cause.response?.status ?? null;
        const responseData = cause.response?.data;

        const payload =
            responseData &&
            typeof responseData === 'object' &&
            !Array.isArray(responseData)
                ? responseData
                : {};

        const message =
            typeof payload.message === 'string'
                ? payload.message
                : status
                  ? `Request failed with status ${status}.`
                  : 'Unable to reach the server.';

        throw new JsonRequestError(message, {
            status,
            errors: payload.errors ?? {},
            cause,
        });
    }
}

export function isCancelledRequest(error) {
    return axios.isCancel(error);
}
