import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { EllipsisOutlined } from '@ant-design/icons';
import {
    App as AntdApp,
    Avatar,
    Button,
    Card,
    Dropdown,
    Image,
    Space,
    Tag,
    Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import CommunityPostActionBar from './CommunityPostActionBar';
import EditCommunityPostModal from './EditCommunityPostModal';
import {
    formatCommunityDate,
    formatCommunityTimestamp,
} from '../Utils/formatCommunityDate';

export default function CommunityPostCard({
    bookOptions,
    post,
    onDeleted,
}) {
    const { message, modal } = AntdApp.useApp();

    const [currentPost, setCurrentPost] = useState(post);
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        setCurrentPost(post);
    }, [post]);

    const deletePost = async () => {
        setDeleting(true);

        try {
            const payload = await jsonRequest({
                url: route(
                    'member.community.posts.destroy',
                    currentPost.id,
                ),
                method: 'POST',
            });

            message.success(
                payload.message ?? 'Post deleted successfully.',
            );

            await onDeleted?.(currentPost);
        } catch (error) {
            message.error(
                getRequestErrorMessage(
                    error,
                    'The post could not be deleted. Try again.',
                ),
            );
        } finally {
            setDeleting(false);
        }
    };

    const handlePostAction = ({ key }) => {
        if (key === 'edit') {
            setEditing(true);

            return;
        }

        if (key === 'delete') {
            modal.confirm({
                title: 'Delete this post?',
                content: 'This action cannot be undone.',
                okText: 'Delete',
                cancelText: 'Cancel',
                okButtonProps: {
                    danger: true,
                },
                onOk: deletePost,
            });
        }
    };

    const postActionItems = [
        currentPost.can?.update && {
            key: 'edit',
            label: 'Edit post',
        },
        currentPost.can?.delete && {
            key: 'delete',
            danger: true,
            label: 'Delete post',
        },
    ].filter(Boolean);

    const handlePostSaved = async (updatedPost) => {
        setCurrentPost((current) => ({
            ...current,
            ...updatedPost,
            comments_count:
                updatedPost.comments_count ?? current.comments_count,
            likes_count:
                updatedPost.likes_count ?? current.likes_count,
            shares_count:
                updatedPost.shares_count ?? current.shares_count,
            liked_by_me:
                updatedPost.liked_by_me ?? current.liked_by_me,
            can: {
                ...current.can,
                ...updatedPost.can,
            },
        }));
        setEditing(false);
        message.success('Post updated successfully.');
    };

    return (
        <div id={`post-${post.id}`}>
            <Card className="overflow-hidden rounded-2xl shadow-sm">
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <Space align="start">
                            <Avatar>
                                {currentPost.author.name.charAt(0).toUpperCase()}
                            </Avatar>

                            <div className="flex flex-wrap items-baseline gap-x-2">
                                <Typography.Text strong>
                                    {currentPost.author.name}
                                </Typography.Text>

                                <Typography.Text
                                    type="secondary"
                                    className="text-xs"
                                >
                                    ·{' '}
                                    <time
                                        dateTime={currentPost.created_at}
                                        title={formatCommunityDate(
                                            currentPost.created_at,
                                        )}
                                    >
                                        {formatCommunityTimestamp(
                                            currentPost.created_at,
                                        )}
                                    </time>
                                </Typography.Text>

                                {currentPost.updated_at &&
                                    new Date(
                                        currentPost.updated_at,
                                    ).getTime() >
                                        new Date(
                                            currentPost.created_at,
                                        ).getTime() && (
                                        <Tag
                                            className="m-0 text-xs"
                                            color="default"
                                            title={formatCommunityDate(
                                                currentPost.updated_at,
                                            )}
                                        >
                                            Edited
                                        </Tag>
                                    )}
                            </div>
                        </Space>

                        {postActionItems.length > 0 && (
                            <Dropdown
                                menu={{
                                    items: postActionItems,
                                    onClick: handlePostAction,
                                }}
                                placement="bottomRight"
                                trigger={['click']}
                            >
                                <Button
                                    type="text"
                                    loading={deleting}
                                    icon={<EllipsisOutlined aria-hidden="true" />}
                                    aria-label="Post options"
                                />
                            </Dropdown>
                        )}
                    </div>

                    <Typography.Paragraph className="mb-0 whitespace-pre-wrap">
                        {currentPost.body}
                    </Typography.Paragraph>

                    {currentPost.images?.length > 0 && (
                        <Image.PreviewGroup>
                            <div
                                className={`grid gap-2 ${currentPost.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
                            >
                                {currentPost.images.map((image, index) => (
                                    <Image
                                        key={image.uuid}
                                        alt={`Image ${index + 1} shared by ${currentPost.author.name}`}
                                        className="h-48 w-full rounded-lg object-cover"
                                        height={currentPost.images.length === 1 ? 320 : 192}
                                        preview={{
                                            mask: 'Open image',
                                        }}
                                        src={image.url}
                                        width="100%"
                                    />
                                ))}
                            </div>
                        </Image.PreviewGroup>
                    )}

                    {currentPost.book && (
                        <div>
                            <Tag>
                                {currentPost.book.title}
                                {' · '}
                                {currentPost.book.author}
                            </Tag>
                        </div>
                    )}

                    <CommunityPostActionBar post={currentPost} />
                </div>
            </Card>

            <EditCommunityPostModal
                bookOptions={bookOptions}
                open={editing}
                post={currentPost}
                onCancel={() => setEditing(false)}
                onSaved={handlePostSaved}
            />
        </div>
    );
}
