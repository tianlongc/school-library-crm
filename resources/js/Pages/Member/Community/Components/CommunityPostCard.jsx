import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { DeleteOutlined } from '@ant-design/icons';
import {
    App as AntdApp,
    Avatar,
    Button,
    Card,
    Image,
    Popconfirm,
    Space,
    Tag,
    Typography,
} from 'antd';
import { useState } from 'react';

export default function CommunityPostCard({
    post,
    onDeleted,
}) {
    const { message } = AntdApp.useApp();

    const [deleting, setDeleting] = useState(false);

    const deletePost = async () => {
        setDeleting(true);

        try {
            const payload = await jsonRequest({
                url: route(
                    'member.community.posts.destroy',
                    post.id,
                ),
                method: 'POST',
            });

            message.success(
                payload.message ?? 'Post deleted successfully.',
            );

            await onDeleted?.(post);
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

    const createdAt = new Intl.DateTimeFormat('en-MY', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(
        new Date(post.created_at),
    );

    return (
        <Card>
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <Space align="start">
                        <Avatar>
                            {post.author.name.charAt(0).toUpperCase()}
                        </Avatar>

                        <div>
                            <Typography.Text strong>
                                {
                                    post.author.name
                                }
                            </Typography.Text>

                            <div>
                                <Typography.Text
                                    type="secondary"
                                    className="text-xs"
                                >
                                    {createdAt}
                                </Typography.Text>
                            </div>
                        </div>
                    </Space>

                    {post.can?.delete && (
                        <Popconfirm
                            title="Delete this post?"
                            description="This action cannot be undone."
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{
                                danger: true,
                            }}
                            onConfirm={deletePost}
                        >
                            <Button
                                type="text"
                                danger
                                loading={deleting}
                                icon={<DeleteOutlined aria-hidden="true" />}
                                aria-label="Delete post"
                            />
                        </Popconfirm>
                    )}
                </div>

                <Typography.Paragraph className="mb-0 whitespace-pre-wrap">
                    {post.body}
                </Typography.Paragraph>

                {post.images?.length > 0 && (
                    <Image.PreviewGroup>
                        <div
                            className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
                        >
                            {post.images.map((image, index) => (
                                <Image
                                    key={image.uuid}
                                    alt={`Image ${index + 1} shared by ${post.author.name}`}
                                    className="h-48 w-full rounded-lg object-cover"
                                    height={post.images.length === 1 ? 320 : 192}
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

                {post.book && (
                    <div>
                        <Tag>
                            {post.book.title}
                            {' · '}
                            {post.book.author}
                        </Tag>
                    </div>
                )}
            </div>
        </Card>
    );
}
