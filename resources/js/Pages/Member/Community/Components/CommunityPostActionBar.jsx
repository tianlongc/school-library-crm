import {
    LikeFilled,
    LikeOutlined,
    MessageOutlined,
    ShareAltOutlined,
} from '@ant-design/icons';
import { Alert, App as AntdApp, Avatar, Button, Input, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import {
    formatCommunityDate,
    formatCommunityTimestamp,
} from '../Utils/formatCommunityDate';

async function copyCommunityShareUrl(value) {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(value);

            return;
        } catch {
            // Fall through to the legacy copy path for insecure contexts.
        }
    }

    const textarea = document.createElement('textarea');

    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand('copy');

    textarea.remove();

    if (!copied) {
        throw new Error('Unable to copy the post link.');
    }
}

export default function CommunityPostActionBar({ post }) {
    const { message } = AntdApp.useApp();

    const [currentPost, setCurrentPost] = useState(post);
    const [comments, setComments] = useState([]);
    const [commentBody, setCommentBody] = useState('');
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentsLoaded, setCommentsLoaded] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [liking, setLiking] = useState(false);
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        setCurrentPost(post);
    }, [post]);

    const loadComments = async () => {
        setCommentsLoading(true);
        setCommentsError('');

        try {
            const payload = await jsonRequest({
                url: route(
                    'member.community.posts.comments.index',
                    post.id,
                ),
                method: 'POST',
            });

            setComments(payload.data ?? []);
            setCommentsLoaded(true);
        } catch (error) {
            setCommentsError(
                getRequestErrorMessage(
                    error,
                    'Comments could not be loaded. Try again.',
                ),
            );
        } finally {
            setCommentsLoading(false);
        }
    };

    const toggleComments = async () => {
        const nextOpen = !commentsOpen;

        setCommentsOpen(nextOpen);

        if (nextOpen && !commentsLoaded) {
            await loadComments();
        }
    };

    const toggleLike = async () => {
        setLiking(true);

        try {
            const payload = await jsonRequest({
                url: route(
                    'member.community.posts.like',
                    post.id,
                ),
                method: 'POST',
            });

            setCurrentPost((current) => ({
                ...current,
                liked_by_me: payload.liked,
                likes_count: payload.likes_count,
            }));
        } catch (error) {
            message.error(
                getRequestErrorMessage(
                    error,
                    'Unable to update the like.',
                ),
            );
        } finally {
            setLiking(false);
        }
    };

    const submitComment = async () => {
        const body = commentBody.trim();

        if (!body) {
            return;
        }

        setSubmittingComment(true);

        try {
            const payload = await jsonRequest({
                url: route(
                    'member.community.posts.comments.store',
                    post.id,
                ),
                method: 'POST',
                data: { body },
            });

            setComments((current) => [
                payload.comment,
                ...current,
            ]);

            setCurrentPost((current) => ({
                ...current,
                comments_count: payload.comments_count,
            }));

            setCommentBody('');
            message.success(payload.message);
        } catch (error) {
            message.error(
                getRequestErrorMessage(
                    error,
                    'Unable to add the comment.',
                ),
            );
        } finally {
            setSubmittingComment(false);
        }
    };

    const sharePost = async () => {
        setSharing(true);

        try {
            const shareUrl = new URL(
                route('member.community.index'),
                window.location.origin,
            );

            shareUrl.hash = `post-${post.id}`;

            let usedClipboard = false;
            let shared = false;

            if (typeof navigator.share === 'function') {
                try {
                    await navigator.share({
                        title: `${post.author.name}'s community post`,
                        text: post.body,
                        url: shareUrl.toString(),
                    });

                    shared = true;
                } catch (error) {
                    if (error?.name === 'AbortError') {
                        return;
                    }
                }
            }

            if (!shared) {
                await copyCommunityShareUrl(
                    shareUrl.toString(),
                );

                usedClipboard = true;
            }

            const payload = await jsonRequest({
                url: route(
                    'member.community.posts.share',
                    post.id,
                ),
                method: 'POST',
            });

            setCurrentPost((current) => ({
                ...current,
                shares_count: payload.shares_count,
            }));

            message.success(
                usedClipboard
                    ? 'Post link copied.'
                    : 'Post shared.',
            );
        } catch (error) {
            message.error(
                getRequestErrorMessage(
                    error,
                    'Unable to share this post.',
                ),
            );
        } finally {
            setSharing(false);
        }
    };

    return (
        <div className="border-t pt-3">
            <Space wrap>
                <Button
                    type="text"
                    icon={
                        currentPost.liked_by_me
                            ? <LikeFilled />
                            : <LikeOutlined />
                    }
                    loading={liking}
                    aria-pressed={currentPost.liked_by_me}
                    onClick={toggleLike}
                >
                    Like {currentPost.likes_count}
                </Button>

                <Button
                    type="text"
                    icon={<MessageOutlined />}
                    loading={commentsLoading}
                    onClick={toggleComments}
                >
                    Comment {currentPost.comments_count}
                </Button>

                <Button
                    type="text"
                    icon={<ShareAltOutlined />}
                    loading={sharing}
                    onClick={sharePost}
                >
                    Share {currentPost.shares_count}
                </Button>
            </Space>

            {commentsOpen && (
                <div className="mt-4 space-y-3">
                    {commentsError && (
                        <Alert
                            type="error"
                            showIcon
                            title="Comments could not be loaded"
                            description={commentsError}
                            action={<Button onClick={loadComments}>Retry</Button>}
                        />
                    )}

                    {commentsLoading && !commentsLoaded ? (
                        <Typography.Text type="secondary">
                            Loading comments…
                        </Typography.Text>
                    ) : commentsLoaded && comments.length === 0 ? (
                        <Typography.Text type="secondary">
                            No comments yet.
                        </Typography.Text>
                    ) : comments.length > 0 ? (
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="flex gap-3"
                                >
                                    <Avatar>
                                        {comment.author.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </Avatar>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-baseline gap-x-2">
                                            <Typography.Text strong>
                                                {comment.author.name}
                                            </Typography.Text>

                                            <Typography.Text
                                                type="secondary"
                                                className="text-xs"
                                            >
                                                ·{' '}
                                                <time
                                                    dateTime={comment.created_at}
                                                    title={formatCommunityDate(
                                                        comment.created_at,
                                                    )}
                                                >
                                                    {formatCommunityTimestamp(
                                                        comment.created_at,
                                                    )}
                                                </time>
                                            </Typography.Text>
                                        </div>

                                        <Typography.Paragraph className="mb-0 mt-1">
                                            {comment.body}
                                        </Typography.Paragraph>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {currentPost.can?.comment && commentsLoaded && (
                        <div className="flex items-end gap-2">
                            <label className="sr-only" htmlFor={`community-comment-${post.id}`}>
                                Write a comment
                            </label>
                            <Input.TextArea
                                id={`community-comment-${post.id}`}
                                value={commentBody}
                                maxLength={1000}
                                autoSize={{
                                    minRows: 2,
                                    maxRows: 4,
                                }}
                                placeholder="Write a comment..."
                                onChange={(event) =>
                                    setCommentBody(
                                        event.target.value,
                                    )
                                }
                            />

                            <Button
                                type="primary"
                                loading={submittingComment}
                                disabled={!commentBody.trim()}
                                onClick={submitComment}
                            >
                                Post
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
