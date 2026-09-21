import PageHeader from '@/Components/PageHeader';
import MemberLayout from '@/Layouts/MemberLayout';
import { isCancelledRequest, jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { Head } from '@inertiajs/react';
import { App as AntdApp, Empty, Pagination, Skeleton } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import CommunityFeed from './Components/CommunityFeed';
import CreatePostCard from './Components/CreatePostCard';

const COMMUNITY_PAGE_SIZE = 10;

export default function Index({
    initialPosts,
    bookOptions,
}) {
    const { message } = AntdApp.useApp();

    const [posts, setPosts] = useState(initialPosts);
    const [loading, setLoading] = useState(false);

    const abortControllerRef = useRef(null);
    const loadPage = useCallback(
        async (page = 1) => {
            abortControllerRef.current?.abort();

            const abortController = new AbortController();

            abortControllerRef.current = abortController;

            setLoading(true);

            try {
                const payload = await jsonRequest({
                    url: route(
                        'member.community.feed',
                    ),
                    method: 'POST',
                    data: {
                        page,
                        per_page: COMMUNITY_PAGE_SIZE,
                    },
                    signal: abortController.signal,
                });

                if (abortController.signal.aborted) {
                    return false;
                }

                setPosts(payload);

                return true;
            } catch (error) {
                if (isCancelledRequest(error)) {
                    return false;
                }

                message.error(
                    getRequestErrorMessage(
                        error,
                        'Unable to load community posts.',
                    ),
                );

                return false;
            } finally {
                if (abortControllerRef.current === abortController) {
                    abortControllerRef.current = null;
                    setLoading(false);
                }
            }
        },
        [message],
    );

    useEffect(
        () => () => {
            abortControllerRef.current?.abort();
            abortControllerRef.current = null;
        },
        [],
    );

    const handlePostCreated = useCallback(
        () => loadPage(1),
        [loadPage],
    );

    const handlePostDeleted = useCallback(() => {
        const page =
            posts.data.length === 1 && posts.meta.current_page > 1
                ? posts.meta.current_page - 1
                : posts.meta.current_page;

        return loadPage(page);
    }, [loadPage, posts.data.length, posts.meta.current_page]);

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

                {loading ? (
                    <Skeleton active avatar paragraph={{ rows: 3 }} />
                ) : posts.data.length === 0 ? (
                    <Empty
                        description="No posts yet. Be the first to share something."
                    />
                ) : (
                    <>
                        <CommunityFeed
                            bookOptions={bookOptions}
                            posts={posts.data}
                            onDeleted={handlePostDeleted}
                        />

                        <div className="flex justify-center pt-2">
                            <Pagination
                                current={posts.meta.current_page}
                                pageSize={posts.meta.per_page}
                                total={posts.meta.total}
                                showSizeChanger={false}
                                onChange={loadPage}
                            />
                        </div>
                    </>
                )}
            </div>
        </MemberLayout>
    );
}
