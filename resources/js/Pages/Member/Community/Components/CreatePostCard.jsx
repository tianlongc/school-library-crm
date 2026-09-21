import { jsonRequest } from '@/Utils/jsonRequest';
import { getLaravelValidationErrors } from '@/Utils/laravelValidation';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { PictureOutlined, PlusOutlined } from '@ant-design/icons';
import { useForm } from '@inertiajs/react';
import {
    App as AntdApp,
    Alert,
    Button,
    Card,
    Form,
    Image,
    Input,
    Select,
    Tag,
    Tooltip,
    Typography,
    Upload,
} from 'antd';
import { useState } from 'react';

export default function CreatePostCard({
    bookOptions,
    onCreated,
}) {
    const { message } = AntdApp.useApp();

    const {
        data,
        setData,
        errors,
        setError,
        clearErrors,
        reset,
    } = useForm({
        body: '',
        book_id: null,
    });

    const [submitting, setSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [fileList, setFileList] = useState([]);
    const [previewImage, setPreviewImage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [showBookPicker, setShowBookPicker] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);

    const selectedBook = bookOptions.find(
        (book) => book.value === data.book_id,
    );

    const imageError =
        errors.images ??
        Object.entries(errors).find(([field]) =>
            field.startsWith('images.'),
        )?.[1];

    const clearImageErrors = () => {
        clearErrors(
            ...Object.keys(errors).filter(
                (field) =>
                    field === 'images' ||
                    field.startsWith('images.'),
            ),
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
        clearErrors();
        setRequestError('');
        setSubmitting(true);

        const formData = new FormData();

        formData.append('body', data.body.trim());

        if (data.book_id) {
            formData.append('book_id', String(data.book_id));
        }

        fileList.forEach((file) => {
            const upload = file.originFileObj ?? file;

            formData.append('images[]', upload);
        });

        try {
            const payload = await jsonRequest({
                url: route(
                    'member.community.posts.store',
                ),
                method: 'POST',
                data: formData,
            });

            reset();
            setFileList([]);
            setShowBookPicker(false);
            setShowImagePicker(false);

            message.success(
                payload.message ??
                    'Your post has been published.',
            );

            await onCreated?.(payload.post);
        } catch (error) {
            const validationErrors = getLaravelValidationErrors(error);

            if (validationErrors) {
                setError(validationErrors);
            } else {
                setRequestError(
                    getRequestErrorMessage(
                        error,
                        'Your post could not be published. Try again.',
                    ),
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card
            className="overflow-hidden rounded-2xl shadow-sm"
            variant="borderless"
        >
            <Form onFinish={submit}>
                {requestError && (
                    <Alert
                        className="mb-4"
                        type="error"
                        title={requestError}
                        showIcon
                    />
                )}

                <div>
                    <Input.TextArea
                        autoSize={{
                            minRows: 3,
                            maxRows: 8,
                        }}
                        className="text-base"
                        value={data.body}
                        maxLength={2000}
                        placeholder="Share your thoughts ..."
                        onChange={(event) => {
                            setData(
                                'body',
                                event.target.value,
                            );

                            clearErrors('body');
                        }}
                    />

                    {errors.body && (
                        <Typography.Text
                            className="mt-1 block"
                            type="danger"
                        >
                            {errors.body}
                        </Typography.Text>
                    )}
                </div>

                {(showImagePicker || fileList.length > 0) && (
                    <div className="mt-3">
                        <Upload
                            accept="image/jpeg,image/png,image/webp"
                            beforeUpload={() => false}
                            fileList={fileList}
                            listType="picture-card"
                            maxCount={4}
                            multiple
                            onChange={({ fileList: nextFileList }) => {
                                setFileList(nextFileList);
                                clearImageErrors();
                            }}
                            onPreview={handlePreview}
                        >
                            {fileList.length < 4 && '+ Add'}
                        </Upload>

                        {imageError && (
                            <Typography.Text type="danger">
                                {imageError}
                            </Typography.Text>
                        )}
                    </div>
                )}

                {showBookPicker && (
                    <div className="mt-3">
                        <Select
                            className="w-full"
                            value={data.book_id ?? undefined}
                            options={bookOptions}
                            placeholder="Add a related book"
                            allowClear
                            showSearch={{ optionFilterProp: 'label' }}
                            onChange={(value) => {
                                setData(
                                    'book_id',
                                    value ?? null,
                                );

                                clearErrors('book_id');
                            }}
                        />

                        {errors.book_id && (
                            <Typography.Text
                                className="mt-1 block"
                                type="danger"
                            >
                                {errors.book_id}
                            </Typography.Text>
                        )}
                    </div>
                )}

                {previewImage && (
                    <Image
                        alt="Selected image preview"
                        preview={{
                            open: previewOpen,
                            onOpenChange: (open) => {
                                setPreviewOpen(open);

                                if (!open) {
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

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                    <div className="flex items-center gap-1">
                        <Tooltip title="Add images">
                            <Button
                                type="text"
                                icon={<PictureOutlined />}
                                aria-label="Add images"
                                aria-expanded={showImagePicker}
                                onClick={() =>
                                    setShowImagePicker(
                                        (current) => !current,
                                    )
                                }
                            />
                        </Tooltip>

                        <Tooltip title="Add a related book">
                            <Button
                                type="text"
                                icon={<PlusOutlined />}
                                aria-label="Add a related book"
                                aria-expanded={showBookPicker}
                                onClick={() =>
                                    setShowBookPicker(
                                        (current) => !current,
                                    )
                                }
                            />
                        </Tooltip>

                        {selectedBook && !showBookPicker && (
                            <Tag
                                closable
                                className="m-0"
                                onClose={() => {
                                    setData('book_id', null);
                                    clearErrors('book_id');
                                }}
                            >
                                {selectedBook.label}
                            </Tag>
                        )}
                    </div>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        disabled={!data.body.trim()}
                    >
                        Post
                    </Button>
                </div>
            </Form>
        </Card>
    );
}
