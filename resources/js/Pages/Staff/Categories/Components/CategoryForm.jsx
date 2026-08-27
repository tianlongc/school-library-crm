import InertiaButton from '@/Components/InertiaButton';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getLaravelValidationErrors } from '@/Utils/laravelValidation';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import TagsOutlined from '@ant-design/icons/TagsOutlined';
import { useForm } from '@inertiajs/react';
import { Alert, Button, Card, Flex, Form, Input } from 'antd';
import { useState } from 'react';

export default function CategoryForm({
    category = null,
    onSuccess,
    submitLabel,
    url,
}) {
    const { clearErrors, data, errors, setData, setError } = useForm({
        name: category?.name ?? '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    const submit = async () => {
        clearErrors();
        setRequestError('');
        setSubmitting(true);

        try {
            const payload = await jsonRequest({
                url,
                method: 'POST',
                data,
            });

            onSuccess(payload);
        } catch (error) {
            const validationErrors = getLaravelValidationErrors(error);

            if (validationErrors) {
                setError(validationErrors);
            } else {
                setRequestError(
                    getRequestErrorMessage(
                        error,
                        'The category could not be saved. Try again.',
                    ),
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const updateName = (value) => {
        setData('name', value);
        clearErrors('name');
    };

    return (
        <Card title="Category details" extra={<TagsOutlined />}>
            <Form layout="vertical" onFinish={submit} requiredMark>
                {requestError && (
                    <Alert
                        className="form-request-alert"
                        type="error"
                        title={requestError}
                        showIcon
                    />
                )}

                <Form.Item
                    htmlFor="category-name"
                    label="Category name"
                    required
                    validateStatus={errors.name ? 'error' : undefined}
                    help={
                        errors.name ??
                        'Category names must be unique. Books can remain uncategorized.'
                    }
                >
                    <Input
                        id="category-name"
                        name="name"
                        autoComplete="off"
                        autoFocus
                        maxLength={255}
                        placeholder="For example, Science fiction"
                        value={data.name}
                        onChange={(event) => updateName(event.target.value)}
                    />
                </Form.Item>

                <Flex className="form-actions" justify="flex-end" gap={8} wrap>
                    <InertiaButton href={route('staff.categories.index')}>
                        Cancel
                    </InertiaButton>
                    <Button htmlType="submit" type="primary" loading={submitting}>
                        {submitLabel}
                    </Button>
                </Flex>
            </Form>
        </Card>
    );
}
