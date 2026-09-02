import { useCallback, useEffect, useRef, useState } from 'react';
import {
    DEFAULT_PAGE_SIZE,
    SEARCH_DEBOUNCE_MS,
} from './tableQuery';
import { isCancelledRequest, jsonRequest } from '@/Utils/jsonRequest';

export function useServerTable({
    initialFilters,
    initialResource,
    queryRouteName,
    debounceMs = SEARCH_DEBOUNCE_MS,
}) {
    const [resource, setResource] = useState(initialResource);
    const [filters, setFilters] = useState(initialFilters);
    const [search, setSearch] = useState(initialFilters.search ?? '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const load = useCallback(
        async (overrides = {}) => {
            abortControllerRef.current?.abort();

            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            setLoading(true);
            setError(null);

            try {
                const payload = await jsonRequest({
                    url: route(queryRouteName),
                    method: 'POST',
                    data: {
                        ...filters,
                        ...overrides,
                    },
                    signal: abortController.signal,
                });

                if (abortController.signal.aborted) {
                    return;
                }

                setResource({
                    data: payload.data,
                    links: payload.links,
                    meta: payload.meta,
                });
                setFilters(payload.filters);
            } catch (requestError) {
                if (!isCancelledRequest(requestError)) {
                    setError(requestError);
                }
            } finally {
                if (abortControllerRef.current === abortController) {
                    abortControllerRef.current = null;
                    setLoading(false);
                }
            }
        },
        [filters, queryRouteName],
    );

    useEffect(() => {
        const normalizedSearch = search.trim();

        if (normalizedSearch === (filters.search ?? '')) {
            return undefined;
        }

        const timeout = window.setTimeout(() => {
            void load({
                page: 1,
                search: normalizedSearch,
            });
        }, debounceMs);

        return () => window.clearTimeout(timeout);
    }, [debounceMs, filters.search, load, search]);

    const handlePageChange = useCallback(
        (page, pageSize) => {
            const currentPageSize = Number(
                filters.per_page ?? DEFAULT_PAGE_SIZE,
            );

            void load({
                page: pageSize === currentPageSize ? page : 1,
                per_page: pageSize,
                search: search.trim(),
            });
        },
        [filters.per_page, search, load],
    );

    const handleTableChange = useCallback(
        (_pagination, _tableFilters, sorter, extra) => {
            if (extra.action !== 'sort') {
                return;
            }

            const activeSorter = Array.isArray(sorter)
                ? sorter[0]
                : sorter;

            void load({
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
        [load, search],
    );

    const setFilter = useCallback(
        (name, value) => {
            void load({
                [name]: value,
                page: 1,
                search: search.trim(),
            });
        },
        [load, search],
    );

    useEffect(
        () => () => abortControllerRef.current?.abort(),
        [],
    );

    return {
        error,
        filters,
        handlePageChange,
        handleTableChange,
        loading,
        refresh: load,
        resource,
        search,
        setFilter,
        setSearch,
    };
}

