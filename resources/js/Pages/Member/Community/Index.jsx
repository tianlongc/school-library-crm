import PageHeader from '@/Components/PageHeader';
import MemberLayout from '@/Layouts/MemberLayout';
import { isCancelledRequest, jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { Head, router } from '@inertiajs/react';
import { Alert, Button, Divider, Empty, FloatButton, Select, Skeleton } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import CommunityFeed from './Components/CommunityFeed';
import CreatePostCard from './Components/CreatePostCard';
import CommunityCategoryNav from './Components/CommunityCategoryNav';
import CommunityGuidelinesCard from './Components/CommunityGuidelinesCard';
import TrendingBooksCard from './Components/TrendingBooksCard';

const COMMUNITY_PAGE_SIZE = 10;

export default function Index({
    initialPosts,
    bookOptions,
    categoryOptions,
    selectedCategoryId,
    trendingBooks,
}) {
    const [posts, setPosts] = useState(initialPosts.data ?? []);
    const [nextCursor, setNextCursor] = useState(initialPosts.meta?.next_cursor ?? null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [failedCursor, setFailedCursor] = useState(null);

    const sentinelRef = useRef(null);
    const loadingRef = useRef(false);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        setPosts(initialPosts.data ?? []);
        setNextCursor(initialPosts.meta?.next_cursor ?? null);
        setLoadError('');
        setFailedCursor(null);
    }, [initialPosts]);

    const loadMore = useCallback(
        async (cursor = nextCursor) => {
            if (!cursor || loadingRef.current) {
                return;
            }

            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            loadingRef.current = true;
            setLoadingMore(true);
            setLoadError('');

            try {
                const payload = await jsonRequest({
                    url: route(
                        'member.community.feed',
                    ),
                    method: 'POST',
                    data: {
                        cursor,
                        per_page: COMMUNITY_PAGE_SIZE,
                        category_id: selectedCategoryId ?? null,
                    },
                    signal: abortController.signal,
                });

                if (abortController.signal.aborted) {
                    return;
                }

                setPosts((current) => {
                    const knownIds = new Set(current.map((post) => post.id));
                    const additions = (payload.data ?? []).filter(
                        (post) => !knownIds.has(post.id),
                    );

                    return [...current, ...additions];
                });

                setNextCursor(payload.meta?.next_cursor ?? null);
                setFailedCursor(null);
            } catch (error) {
                if (!isCancelledRequest(error)) {
                    setFailedCursor(cursor);
                    setLoadError(
                        getRequestErrorMessage(
                            error,
                            'Community posts could not be loaded. Try again.',
                        ),
                    );
                }
            } finally {
                if (abortControllerRef.current === abortController) {
                    abortControllerRef.current = null;
                    loadingRef.current = false;
                    setLoadingMore(false);
                }
            }
        }, [nextCursor, selectedCategoryId]);

    const handleCategoryChange = useCallback((categoryId) => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        loadingRef.current = true;

        setNextCursor(null);
        setLoadingMore(false);
        setLoadError('');
        setFailedCursor(null);

        router.get(
            route('member.community.index'),
            categoryId === undefined || categoryId === null
                ? {}
                : { category_id: categoryId },
            {
                preserveScroll: true,
                preserveState: false,
                onFinish: () => {
                    loadingRef.current = false;
                },
            },
        );
    }, []);

    useEffect(() => {
        if (!nextCursor || loadingMore || loadError || !sentinelRef.current) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                void loadMore(nextCursor);
            }
        }, { rootMargin: '300px 0px' });

        observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [loadError, loadMore, loadingMore, nextCursor]);

    useEffect(() => () => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        loadingRef.current = false;
    }, []);

    const handlePostCreated = useCallback((newPost) => {
        if (!newPost) {
            return;
        }

        setPosts((current) => [
            newPost,
            ...current.filter((post) => post.id !== newPost.id),
        ]);
    }, []);

    const handlePostDeleted = useCallback((deletedPost) => {
        setPosts((current) =>
            current.filter((post) => post.id !== deletedPost.id),
        );
    }, []);

    return (
        <MemberLayout wide>
            <Head title="Community" />

            <div className="grid w-full grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="lg:col-span-2">
                    <PageHeader
                        title="Community"
                        description="Share a title, ask a question, or recommend your next read."
                        className="!mb-0 !pb-3"
                    />
                </div>

                <section aria-label="Community feed" className="min-w-0 space-y-4">
                    <div className="hidden md:block">
                        <CommunityCategoryNav
                            categoryOptions={categoryOptions}
                            selectedCategoryId={selectedCategoryId}
                            onChange={handleCategoryChange}
                        />
                    </div>

                    <label className="block space-y-2 md:hidden">
                        <span className="text-sm font-medium text-slate-700">
                            Filter by category
                        </span>

                        <Select
                            aria-label="Filter community posts by category"
                            allowClear
                            className="w-full"
                            onChange={handleCategoryChange}
                            options={categoryOptions}
                            placeholder="All categories"
                            value={selectedCategoryId ?? undefined}
                        />
                    </label>

                    <CreatePostCard
                        bookOptions={bookOptions}
                        onCreated={handlePostCreated}
                    />

                    {posts.length === 0 ? (
                        loadError ? (
                            <Alert
                                type="error"
                                showIcon
                                title="Posts could not be loaded"
                                description={loadError}
                                action={
                                    <Button onClick={() => loadMore(failedCursor)}>
                                        Retry
                                    </Button>
                                }
                            />
                        ) : (
                            <Empty description="No posts yet. Be the first to share something." />
                        )
                    ) : (
                        <>
                            <CommunityFeed
                                bookOptions={bookOptions}
                                posts={posts}
                                onDeleted={handlePostDeleted}
                            />

                            {nextCursor && <div ref={sentinelRef} aria-hidden="true" />}

                            {loadingMore && (
                                <div role="status" aria-live="polite">
                                    <span className="sr-only">Loading more posts</span>
                                    <Skeleton active avatar paragraph={{ rows: 2 }} />
                                </div>
                            )}

                            {loadError && (
                                <Alert
                                    type="error"
                                    showIcon
                                    title="Posts could not be loaded"
                                    description={loadError}
                                    action={
                                        <Button
                                            disabled={loadingMore}
                                            onClick={() => loadMore(failedCursor)}
                                        >
                                            Retry
                                        </Button>
                                    }
                                />
                            )}

                            {!nextCursor && !loadingMore && !loadError && (
                                <Divider plain>
                                    You have reached the bottom of the community!
                                </Divider>
                            )}
                        </>
                    )}
                </section>

                <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
                    <TrendingBooksCard books={trendingBooks} />
                    <CommunityGuidelinesCard />
                </aside>
            </div>

            <FloatButton.BackTop
                aria-label="Back to top"
                tooltip="Back to top"
                visibilityHeight={600}
                showProgress
                style={{
                    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
                    insetInlineEnd: 24,
                }}
            />
        </MemberLayout>
    );
}
