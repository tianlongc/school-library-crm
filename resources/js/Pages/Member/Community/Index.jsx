import PageHeader from '@/Components/PageHeader';
import MemberLayout from '@/Layouts/MemberLayout';
import { isCancelledRequest, jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { Head } from '@inertiajs/react';
import { Alert, Button, Divider, Empty, FloatButton, Skeleton } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import CommunityFeed from './Components/CommunityFeed';
import CreatePostCard from './Components/CreatePostCard';

const COMMUNITY_PAGE_SIZE = 10;

export default function Index({
    initialPosts,
    bookOptions,
}) {
    const [posts, setPosts] = useState(initialPosts.data ?? []);
    const [nextCursor, setNextCursor] = useState(initialPosts.meta?.next_cursor ?? null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [failedCursor, setFailedCursor] = useState(null);

    const sentinelRef = useRef(null);
    const loadingRef = useRef(false);
    const abortControllerRef = useRef(null);

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
        }, [nextCursor]);

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
        <MemberLayout>
            <Head title="Community" />

            <div className="mx-auto max-w-3xl space-y-5">
                <PageHeader
                    title="Community"
                    description="Share a title, ask a question, or recommend your next read."
                />

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
