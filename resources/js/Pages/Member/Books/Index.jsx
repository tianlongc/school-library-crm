import { SEARCH_DEBOUNCE_MS } from '@/Components/Tables/tableQuery';
import MemberLayout from '@/Layouts/MemberLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Alert,
    App as AntdApp,
    Button,
    Card,
    Empty,
    Flex,
    Input,
    Pagination,
    Spin,
    Tag,
    Typography,
} from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

function BookCover({ book }) {
    const [failedCoverUrl, setFailedCoverUrl] = useState(null);
    const hasCover = book.cover_url && failedCoverUrl !== book.cover_url;

    return (
        <div className="flex h-36 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 p-2 text-center">
            {hasCover ? (
                <img
                    alt=""
                    className="h-full w-full object-cover"
                    decoding="async"
                    loading="lazy"
                    onError={() => setFailedCoverUrl(book.cover_url)}
                    src={book.cover_url}
                />
            ) : (
                <Typography.Text aria-hidden="true" type="secondary">
                    No cover
                </Typography.Text>
            )}
        </div>
    );
}

export default function Index({ books, borrowingEligibility, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [loading, setLoading] = useState(false);
    const [borrowingBookId, setBorrowingBookId] = useState(null);
    const cancelTokenRef = useRef(null);
    const { message, modal } = AntdApp.useApp();
    const canBorrowBooks = Boolean(auth.can.borrowBooks);
    const eligibilityMessage = canBorrowBooks
        ? borrowingEligibility.message
        : 'Your account does not currently have borrowing access.';
    const resultCount = books.meta.total;

    const visitCatalogue = useCallback(
        ({ page, search: nextSearch = '' } = {}) => {
            const previousCancelToken = cancelTokenRef.current;
            cancelTokenRef.current = null;
            previousCancelToken?.cancel();

            const parameters = {};
            const normalizedSearch = nextSearch.trim();
            let currentCancelToken = null;

            if (normalizedSearch) {
                parameters.search = normalizedSearch;
            }

            if (page) {
                parameters.page = page;
            }

            router.get(route('member.books.index'), parameters, {
                only: ['books', 'filters'],
                onCancelToken: (cancelToken) => {
                    currentCancelToken = cancelToken;
                    cancelTokenRef.current = cancelToken;
                },
                onFinish: () => {
                    if (cancelTokenRef.current !== currentCancelToken) {
                        return;
                    }

                    cancelTokenRef.current = null;
                    setLoading(false);
                },
                onStart: () => setLoading(true),
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
        },
        [],
    );

    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        const normalizedSearch = search.trim();

        if (normalizedSearch === (filters.search ?? '')) {
            return undefined;
        }

        const timeout = window.setTimeout(() => {
            visitCatalogue({
                page: 1,
                search: normalizedSearch,
            });
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timeout);
    }, [filters.search, search, visitCatalogue]);

    useEffect(
        () => () => {
            const activeCancelToken = cancelTokenRef.current;
            cancelTokenRef.current = null;
            activeCancelToken?.cancel();
        },
        [],
    );

    const confirmBorrow = (book) => {
        modal.confirm({
            title: 'Borrow this book?',
            content: `${book.title} will be due in 14 days.`,
            okText: 'Borrow book',
            cancelText: 'Cancel',
            async onOk() {
                setBorrowingBookId(book.id);

                try {
                    const payload = await jsonRequest({
                        url: route('member.books.borrow', book.id),
                        method: 'POST',
                    });

                    message.success(payload.message);
                    router.reload({
                        only: ['books', 'borrowingEligibility'],
                    });
                } catch (error) {
                    message.error(
                        getRequestErrorMessage(
                            error,
                            'The book could not be borrowed. Try again.',
                        ),
                    );

                    throw error;
                } finally {
                    setBorrowingBookId(null);
                }
            },
        });
    };

    return (
        <MemberLayout>
            <Head title="Catalogue" />

            <Flex className="mb-6 w-full max-w-3xl" gap={16} vertical>
                <div>
                    <Typography.Title level={1} className="member-welcome-title">
                        Find your next book
                    </Typography.Title>
                    <Typography.Paragraph
                        className="member-welcome-copy !mb-0"
                        type="secondary"
                    >
                        Search by title, author, or ISBN and borrow any available
                        copy.
                    </Typography.Paragraph>
                </div>
                <Input
                    allowClear
                    aria-busy={loading}
                    aria-label="Search the member catalogue"
                    autoComplete="off"
                    className="w-full"
                    prefix={<SearchOutlined />}
                    suffix={loading ? <Spin size="small" /> : null}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Title, author, or ISBN"
                    value={search}
                />
            </Flex>

            {eligibilityMessage && (
                <Alert
                    className="mb-6"
                    description={eligibilityMessage}
                    showIcon
                    title="Borrowing unavailable"
                    type="warning"
                />
            )}

            <Typography.Text
                aria-atomic="true"
                aria-live="polite"
                className="mb-4 block"
                type="secondary"
            >
                {resultCount}{' '}
                {resultCount === 1 ? 'book' : 'books'}{' '}
                {filters.search ? 'found' : 'in the catalogue'}
            </Typography.Text>

            {books.data.length === 0 ? (
                <Card>
                    <Empty
                        description={
                            filters.search
                                ? 'No books match your search.'
                                : 'No books are available in the catalogue yet.'
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {books.data.map((book) => {
                        const isAvailable = book.available_copies > 0;
                        const canBorrow =
                            canBorrowBooks &&
                            borrowingEligibility.eligible &&
                            isAvailable &&
                            !book.has_active_loan;
                        let borrowButtonLabel = 'Borrow';

                        if (book.has_active_loan) {
                            borrowButtonLabel = 'Already borrowed';
                        } else if (!isAvailable) {
                            borrowButtonLabel = 'Unavailable';
                        } else if (!canBorrow) {
                            borrowButtonLabel = 'Borrowing unavailable';
                        }

                        return (
                            <Card
                                key={book.id}
                                className="flex h-full flex-col"
                                classNames={{ body: 'flex flex-1 flex-col' }}
                            >
                                <Flex
                                    className="h-full flex-1"
                                    gap={16}
                                    justify="space-between"
                                    vertical
                                >
                                    <Flex align="flex-start" gap={16}>
                                        <BookCover book={book} />
                                        <Flex
                                            className="min-w-0 flex-1"
                                            gap={4}
                                            vertical
                                        >
                                            <Typography.Title
                                                className="!mb-1 break-words"
                                                level={4}
                                            >
                                                {book.title}
                                            </Typography.Title>
                                            <Typography.Text
                                                className="block break-words"
                                                type="secondary"
                                            >
                                                {book.author}
                                            </Typography.Text>
                                            {book.category?.name && (
                                                <Typography.Text
                                                    className="block break-words text-xs"
                                                    type="secondary"
                                                >
                                                    {book.category.name}
                                                </Typography.Text>
                                            )}
                                            <Tag
                                                className="!mr-0 w-fit"
                                                color={isAvailable ? 'success' : 'default'}
                                            >
                                                {isAvailable
                                                    ? `${book.available_copies} available`
                                                    : 'Unavailable'}
                                            </Tag>
                                        </Flex>
                                    </Flex>

                                    <div className="min-w-0 flex-1">
                                        <Typography.Paragraph
                                            className="!mb-2"
                                            ellipsis={{ rows: 3 }}
                                            type="secondary"
                                        >
                                            {book.description ||
                                                'No description is available for this book.'}
                                        </Typography.Paragraph>
                                        {book.isbn && (
                                            <Typography.Text
                                                className="break-words text-xs"
                                                type="secondary"
                                            >
                                                ISBN {book.isbn}
                                            </Typography.Text>
                                        )}
                                    </div>

                                    <Flex
                                        align="center"
                                        gap={12}
                                        justify="space-between"
                                        wrap
                                    >
                                        {book.has_active_loan ? (
                                            <Tag color="processing">On your loans</Tag>
                                        ) : (
                                            <Typography.Text type="secondary">
                                                {book.total_copies}{' '}
                                                {book.total_copies === 1
                                                    ? 'copy'
                                                    : 'copies'}
                                            </Typography.Text>
                                        )}
                                        <Button
                                            disabled={!canBorrow}
                                            loading={borrowingBookId === book.id}
                                            onClick={() => confirmBorrow(book)}
                                            type="primary"
                                        >
                                            {borrowButtonLabel}
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Card>
                        );
                    })}
                </div>
            )}

            {books.meta.last_page > 1 && (
                <Flex className="mt-6" justify="center">
                    <Pagination
                        current={books.meta.current_page}
                        onChange={(page) =>
                            visitCatalogue({
                                page,
                                search: filters.search ?? '',
                            })
                        }
                        pageSize={books.meta.per_page}
                        showSizeChanger={false}
                        total={books.meta.total}
                    />
                </Flex>
            )}
        </MemberLayout>
    );
}
