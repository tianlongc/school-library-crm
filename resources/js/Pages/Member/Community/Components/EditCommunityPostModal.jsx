import {
    CloseOutlined,
    PictureOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Form,
    Image,
    Input,
    Modal,
    Select,
    Typography,
    Upload,
} from 'antd';
import { useEffect, useState } from 'react';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getLaravelValidationErrors } from '@/Utils/laravelValidation';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';

export default function EditCommunityPostModal({
    bookOptions,
    onCancel,
    onSaved,
    open,
    post,
}) {
    const [body, setBody] = useState('');
    const [bookId, setBookId] = useState(null);
    const [existingImages, setExistingImages] = useState([]);
    const [removedImageUuids, setRemovedImageUuids] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [previewImage, setPreviewImage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [requestError, setRequestError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open || !post) {
            return;
        }

        setBody(post.body ?? '');
        setBookId(post.book?.id ?? null);
        setExistingImages(post.images ?? []);
        setRemovedImageUuids([]);
        setFileList([]);
        setPreviewImage('');
        setPreviewOpen(false);
        setErrors({});
        setRequestError('');
    }, [open, post]);

    const visibleExistingImages = existingImages.filter(
        (image) => !removedImageUuids.includes(image.uuid),
    );
    const remainingImageSlots = Math.max(
        0,
        4 - visibleExistingImages.length,
    );
    const imageError =
        errors.images ?? errors.remove_image_uuids;

    const markImageForRemoval = (uuid) => {
        setRemovedImageUuids((current) => [
            ...current,
            uuid,
        ]);
        setErrors((current) => ({
            ...current,
            images: undefined,
            remove_image_uuids: undefined,
        }));
    };

    const restoreImage = (uuid) => {
        if (visibleExistingImages.length + fileList.length >= 4) {
            setErrors((current) => ({
                ...current,
                images: 'Remove a new image before restoring this image.',
            }));

            return;
        }

        setRemovedImageUuids((current) =>
            current.filter((imageUuid) => imageUuid !== uuid),
        );
    };

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.readAsDataURL(
                    file.originFileObj ?? file,
                );
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
            });
        }

        setPreviewImage(file.url ?? file.preview);
        setPreviewOpen(true);
    };

    const submit = async () => {
        setErrors({});
        setRequestError('');
        setSubmitting(true);

        const formData = new FormData();

        formData.append('body', body.trim());
        formData.append('book_id', bookId ? String(bookId) : '');

        removedImageUuids.forEach((uuid) => {
            formData.append('remove_image_uuids[]', uuid);
        });

        fileList.forEach((file) => {
            formData.append(
                'images[]',
                file.originFileObj ?? file,
            );
        });

        try {
            const payload = await jsonRequest({
                url: route(
                    'member.community.posts.update',
                    post.id,
                ),
                method: 'POST',
                data: formData,
            });

            await onSaved?.(payload.post);
        } catch (error) {
            const validationErrors = getLaravelValidationErrors(error);

            if (validationErrors) {
                setErrors(validationErrors);
            } else {
                setRequestError(
                    getRequestErrorMessage(
                        error,
                        'The post could not be updated. Try again.',
                    ),
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            title="Edit post"
            footer={null}
            onCancel={onCancel}
        >
            <Form
                className="pt-2"
                layout="vertical"
                onFinish={submit}
            >
                {requestError && (
                    <Alert
                        className="mb-4"
                        type="error"
                        title={requestError}
                        showIcon
                    />
                )}

                <Form.Item
                    label="Post"
                    validateStatus={errors.body ? 'error' : undefined}
                    help={errors.body}
                    required
                >
                    <Input.TextArea
                        autoSize={{
                            minRows: 4,
                            maxRows: 10,
                        }}
                        value={body}
                        maxLength={2000}
                        showCount
                        onChange={(event) => {
                            setBody(event.target.value);
                            setErrors((current) => ({
                                ...current,
                                body: undefined,
                            }));
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label="Related book"
                    validateStatus={errors.book_id ? 'error' : undefined}
                    help={errors.book_id}
                >
                    <Select
                        value={bookId ?? undefined}
                        options={bookOptions}
                        placeholder="Select a book (optional)"
                        allowClear
                        showSearch={{ optionFilterProp: 'label' }}
                        onChange={(value) => {
                            setBookId(value ?? null);
                            setErrors((current) => ({
                                ...current,
                                book_id: undefined,
                            }));
                        }}
                    />
                </Form.Item>

                <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <Typography.Text strong>
                            Images
                        </Typography.Text>
                        <Typography.Text type="secondary">
                            {visibleExistingImages.length + fileList.length}/4
                        </Typography.Text>
                    </div>
                    <Typography.Paragraph className="mb-2" type="secondary">
                        Up to 4 JPEG, PNG, or WebP images, 5 MB each.
                    </Typography.Paragraph>

                    {existingImages.length > 0 && (
                        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {existingImages.map((image, index) => {
                                const removed = removedImageUuids.includes(
                                    image.uuid,
                                );

                                return (
                                    <div
                                        key={image.uuid}
                                        className="relative overflow-hidden rounded-lg"
                                    >
                                        <Image
                                            alt={`Image ${index + 1} shared by ${post.author.name}`}
                                            className={`h-24 w-full object-cover ${removed ? 'opacity-40' : ''}`}
                                            preview={{
                                                mask: 'Open image',
                                            }}
                                            src={image.url}
                                            width="100%"
                                        />

                                        <Button
                                            className="absolute right-1 top-1"
                                            danger={!removed}
                                            icon={
                                                removed ? (
                                                    <UndoOutlined />
                                                ) : (
                                                    <CloseOutlined />
                                                )
                                            }
                                            size="small"
                                            type="primary"
                                            aria-label={
                                                removed
                                                    ? 'Keep image'
                                                    : 'Remove image'
                                            }
                                            onClick={() =>
                                                removed
                                                    ? restoreImage(image.uuid)
                                                    : markImageForRemoval(
                                                          image.uuid,
                                                      )
                                            }
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {remainingImageSlots > 0 && (
                        <Upload
                            accept="image/jpeg,image/png,image/webp"
                            beforeUpload={() => false}
                            fileList={fileList}
                            listType="picture-card"
                            maxCount={remainingImageSlots}
                            multiple
                            onChange={({ fileList: nextFileList }) => {
                                setFileList(nextFileList);
                                setErrors((current) => ({
                                    ...current,
                                    images: undefined,
                                }));
                            }}
                            onPreview={handlePreview}
                        >
                            <PictureOutlined />
                            <span className="sr-only">
                                Add images
                            </span>
                        </Upload>
                    )}

                    {imageError && (
                        <Typography.Text type="danger">
                            {imageError}
                        </Typography.Text>
                    )}
                </div>

                {previewImage && (
                    <Image
                        alt="Selected image preview"
                        preview={{
                            open: previewOpen,
                            onOpenChange: (openPreview) => {
                                setPreviewOpen(openPreview);

                                if (!openPreview) {
                                    setPreviewImage('');
                                }
                            },
                        }}
                        src={previewImage}
                        styles={{
                            root: {
                                display: 'none',
                            },
                        }}
                    />
                )}

                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        disabled={!body.trim()}
                    >
                        Save changes
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
