import { Button, Col, Form, Image, Input, InputNumber, Row, Select, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

const errorStatus = (message) => (message ? 'error' : undefined);

export default function BookFormFields({
    categories,
    clearErrors,
    data,
    errors,
    setData,
}) {
    const coverInputRef = useRef(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);

    useEffect(() => {
        if (!data.cover) {
            setCoverPreviewUrl(null);
            return;
        }

        const previewUrl = URL.createObjectURL(data.cover);
        setCoverPreviewUrl(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [data.cover]);

    const updateField = (field, value) => {
        setData(field, value);
        clearErrors(field);
    };

    return (
        <Row gutter={[16, 0]}>
            <Col span={24}>
                <Form.Item
                    htmlFor="title"
                    label="Title"
                    required
                    validateStatus={errorStatus(errors.title)}
                    help={errors.title}
                >
                    <Input
                        id="title"
                        name="title"
                        autoComplete="off"
                        maxLength={255}
                        placeholder="For example, The Little Prince"
                        value={data.title}
                        onChange={(event) =>
                            updateField('title', event.target.value)
                        }
                    />
                </Form.Item>
            </Col>

            <Col xs={24} md={12}>
                <Form.Item
                    htmlFor="author"
                    label="Author"
                    required
                    validateStatus={errorStatus(errors.author)}
                    help={errors.author}
                >
                    <Input
                        id="author"
                        name="author"
                        autoComplete="off"
                        maxLength={255}
                        placeholder="Author name"
                        value={data.author}
                        onChange={(event) =>
                            updateField('author', event.target.value)
                        }
                    />
                </Form.Item>
            </Col>

            <Col xs={24} md={12}>
                <Form.Item
                    htmlFor="isbn"
                    label="ISBN"
                    required
                    validateStatus={errorStatus(errors.isbn)}
                    help={errors.isbn ?? 'Enter exactly 13 characters.'}
                >
                    <Input
                        id="isbn"
                        name="isbn"
                        autoComplete="off"
                        maxLength={13}
                        placeholder="9780132350884"
                        spellCheck={false}
                        value={data.isbn}
                        onChange={(event) =>
                            updateField('isbn', event.target.value)
                        }
                    />
                </Form.Item>
            </Col>

            <Col xs={24} md={12}>
                <Form.Item
                    htmlFor="category_id"
                    label="Category"
                    validateStatus={errorStatus(errors.category_id)}
                    help={
                        errors.category_id ??
                        'Choose the catalogue section readers will browse.'
                    }
                >
                    <Select
                        id="category_id"
                        aria-label="Category"
                        allowClear
                        options={categories.map((category) => ({
                            label: category.name,
                            value: category.id,
                        }))}
                        placeholder="Uncategorized"
                        value={data.category_id || undefined}
                        onChange={(value) =>
                            updateField('category_id', value ?? '')
                        }
                    />
                </Form.Item>
            </Col>

            <Col xs={24} md={12}>
                <Form.Item
                    htmlFor="total_copies"
                    label="Total copies"
                    required
                    validateStatus={errorStatus(errors.total_copies)}
                    help={
                        errors.total_copies ??
                        'Physical copies owned by the library.'
                    }
                >
                    <InputNumber
                        id="total_copies"
                        name="total_copies"
                        className="w-full"
                        min={1}
                        precision={0}
                        value={data.total_copies}
                        onChange={(value) =>
                            updateField('total_copies', value ?? 1)
                        }
                    />
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item
                    htmlFor="cover"
                    label="Cover image"
                    validateStatus={errorStatus(errors.cover)}
                    help={errors.cover ?? 'JPEG, PNG or WebP. Maximum 5 MB.'}
                >
                    <input
                        id="cover"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        type="file"
                        ref={coverInputRef}
                        tabIndex={-1}
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) updateField('cover', file);
                            event.target.value = '';
                        }}
                    />
                    <div className="flex flex-col items-start gap-2">
                        {(coverPreviewUrl || (data.cover_url && !data.cover)) && (
                            <Image
                                src={coverPreviewUrl ?? data.cover_url}
                                alt={coverPreviewUrl ? 'Selected book cover preview' : 'Current book cover'}
                                width={110}
                                preview
                                className="book-form-cover"
                            />
                        )}
                        <Button onClick={() => coverInputRef.current?.click()}>
                            {data.cover || data.cover_url ? 'Replace cover' : 'Choose cover'}
                        </Button>
                        {data.cover && <Typography.Text type="secondary">{data.cover.name}</Typography.Text>}
                    </div>
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item
                    htmlFor="description"
                    label="Description"
                    validateStatus={errorStatus(errors.description)}
                    help={errors.description}
                >
                    <Input.TextArea
                        id="description"
                        name="description"
                        autoComplete="off"
                        placeholder="Add a short summary or cataloguing notes"
                        rows={6}
                        value={data.description}
                        onChange={(event) =>
                            updateField('description', event.target.value)
                        }
                    />
                </Form.Item>
            </Col>
        </Row>
    );
}
