import InertiaButton from '@/Components/InertiaButton';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getLaravelValidationErrors } from '@/Utils/laravelValidation';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { useForm } from '@inertiajs/react';
import { Alert, Button, Card, Flex, Form, Typography } from 'antd';
import { useState } from 'react';
import BookFormFields from './BookFormFields';

export default function BookForm({
    book = null,
    categories = [],
    submitLabel,
    url,
    onSuccess,
}) {
    const { data, setData, errors, setError, clearErrors } = useForm({
        title: book?.title ?? '',
        author: book?.author ?? '',
        isbn: book?.isbn ?? '',
        description: book?.description ?? '',
        total_copies: book?.total_copies ?? 1,
        category_id: book?.category_id ?? '',
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
                        'The book could not be saved. Try again.',
                    ),
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card
            title="Book information"
            extra={
                <Typography.Text type="secondary">
                    Required fields are marked
                </Typography.Text>
            }
        >
            <Form layout="vertical" onFinish={submit} requiredMark>
                {requestError && (
                    <Alert
                        className="form-request-alert"
                        type="error"
                        title={requestError}
                        showIcon
                    />
                )}

                <BookFormFields
                    categories={categories}
                    data={data}
                    errors={errors}
                    setData={setData}
                    clearErrors={clearErrors}
                />

                <Flex className="form-actions" justify="flex-end" gap={8} wrap>
                    <InertiaButton href={route('staff.books.index')}>
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
