import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    compactTableQuery,
    DEFAULT_PAGE_SIZE,
    SEARCH_DEBOUNCE_MS,
} from './tableQuery';

export function useServerTable({
    filters,
    resource,
    routeName,
    debounceMs = SEARCH_DEBOUNCE_MS,
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [loading, setLoading] = useState(false);
    const cancelTokenRef = useRef(null);

    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    const visit = useCallback(
        (overrides = {}) => {
            const previousCancelToken = cancelTokenRef.current;
            cancelTokenRef.current = null;
            previousCancelToken?.cancel();

            let currentCancelToken = null;

            router.get(
                route(routeName),
                compactTableQuery({
                    ...filters,
                    ...overrides,
                }),
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: [resource, 'filters'],
                    onCancelToken: (cancelToken) => {
                        currentCancelToken = cancelToken;
                        cancelTokenRef.current = cancelToken;
                    },
                    onStart: () => setLoading(true),
                    onFinish: () => {
                        if (cancelTokenRef.current !== currentCancelToken) {
                            return;
                        }

                        cancelTokenRef.current = null;
                        setLoading(false);
                    },
                },
            );
        },
        [filters, resource, routeName],
    );

    useEffect(() => {
        const normalizedSearch = search.trim();

        if (normalizedSearch === (filters.search ?? '')) {
            return undefined;
        }

        const timeout = window.setTimeout(() => {
            visit({
                page: 1,
                search: normalizedSearch,
            });
        }, debounceMs);

        return () => window.clearTimeout(timeout);
    }, [debounceMs, filters.search, search, visit]);

    const handlePageChange = useCallback(
        (page, pageSize) => {
            const currentPageSize = Number(
                filters.per_page ?? DEFAULT_PAGE_SIZE,
            );

            visit({
                page: pageSize === currentPageSize ? page : 1,
                per_page: pageSize,
                search: search.trim(),
            });
        },
        [filters.per_page, search, visit],
    );

    const handleTableChange = useCallback(
        (_pagination, _tableFilters, sorter, extra) => {
            if (extra.action !== 'sort') {
                return;
            }

            const activeSorter = Array.isArray(sorter)
                ? sorter[0]
                : sorter;

            visit({
                page: 1,
                search: search.trim(),
                sort: activeSorter.order
                    ? activeSorter.columnKey
                    : undefined,
                direction:
                    activeSorter.order === 'ascend'
                        ? 'asc'
                        : activeSorter.order === 'descend'
                          ? 'desc'
                          : undefined,
            });
        },
        [search, visit],
    );

    const setFilter = useCallback(
        (name, value) => {
            visit({
                page: 1,
                search: search.trim(),
                [name]: value,
            });
        },
        [search, visit],
    );

    useEffect(
        () => () => {
            const activeCancelToken = cancelTokenRef.current;
            cancelTokenRef.current = null;
            activeCancelToken?.cancel();
        },
        [],
    );

    return {
        handlePageChange,
        handleTableChange,
        loading,
        search,
        setFilter,
        setSearch,
        visit,
    };
}

