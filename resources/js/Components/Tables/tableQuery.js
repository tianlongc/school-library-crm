export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
export const SEARCH_DEBOUNCE_MS = 400;

export function compactTableQuery(parameters) {
    return Object.fromEntries(
        Object.entries(parameters).filter(
            ([, value]) =>
                value !== '' &&
                value !== null &&
                value !== undefined,
        ),
    );
}

export function getSortOrder(filters, key) {
    if (filters.sort !== key) {
        return null;
    }

    return filters.direction === 'asc' ? 'ascend' : 'descend';
}