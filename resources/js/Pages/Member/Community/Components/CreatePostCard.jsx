import { jsonRequest } from '@/Utils/jsonRequest';
import { getLaravelValidationErrors } from '@/Utils/laravelValidation';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { useForm } from '@inertiajs/react';
import {
    App as AntdApp,
    Alert,
    Button,
    Card,
    Form,
    Image,
    Input,
    Upload,
    Select,
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

    const imageError =
        errors.images ??
        Object.entries(errors).find(([field]) =>
            field.startsWith('images.'),
        )?.[1];

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
        <Card title="Share with the community">
            <Form
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
                    label="What are you reading?"
                    validateStatus={
                        errors.body
                            ? 'error'
                            : undefined
                    }
                    help={errors.body}
                    required
                >
                    <Input.TextArea
                        value={data.body}
                        rows={4}
                        maxLength={2000}
                        showCount
                        placeholder="Share your thoughts, recommendation, or something interesting about a book..."
                        onChange={(event) => {
                            setData(
                                'body',
                                event.target.value,
                            );

                            clearErrors('body');
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label="Related book"
                    validateStatus={errors.book_id ? 'error' : undefined}
                    help={errors.book_id}
                >
                    <Select
                        value={data.book_id ?? undefined}
                        options={bookOptions}
                        placeholder="Select a book (optional)"
                        allowClear
                        showSearch={{ optionFilterProp: 'label' }}
                        onChange={(value) => {
                            setData(
                                'book_id',
                                value ?? null,
                            );

                            clearErrors(
                                'book_id',
                            );
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label="Images"
                    extra="Add up to 4 JPG, PNG, or WebP images (5 MB each)."
                    validateStatus={
                        imageError ? 'error' : undefined
                    }
                    help={imageError}
                >
                    <Upload
                        accept="image/jpeg,image/png,image/webp"
                        beforeUpload={() => false}
                        fileList={fileList}
                        listType="picture-card"
                        maxCount={4}
                        multiple
                        onChange={({ fileList: nextFileList }) => {
                            setFileList(nextFileList);

                            clearErrors(
                                ...Object.keys(errors).filter(
                                    (field) =>
                                        field === 'images' ||
                                        field.startsWith('images.'),
                                ),
                            );
                        }}
                        onPreview={handlePreview}
                    >
                        {fileList.length < 4 && '+ Add'}
                    </Upload>
                </Form.Item>

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

                <div>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        disabled={
                            !data.body.trim()
                        }
                    >
                        Publish
                    </Button>
                </div>
            </Form>
        </Card>
    );
}
