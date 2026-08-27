import { Col, Form, Input, InputNumber, Row, Select } from 'antd';

const errorStatus = (message) => (message ? 'error' : undefined);

export default function BookFormFields({
    categories,
    clearErrors,
    data,
    errors,
    setData,
}) {
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
