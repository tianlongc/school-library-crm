import InertiaButton from '@/Components/InertiaButton';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getLaravelValidationErrors } from '@/Utils/laravelValidation';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import BarcodeOutlined from '@ant-design/icons/BarcodeOutlined';
import IdcardOutlined from '@ant-design/icons/IdcardOutlined';
import { useForm } from '@inertiajs/react';
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Flex,
    Form,
    Input,
    Row,
    Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';

const errorStatus = (message) => (message ? 'error' : undefined);

export default function LoanForm({ onSuccess }) {
    const { clearErrors, data, errors, setData, setError } = useForm({
        member_number: '',
        isbn: '',
        due_at: '',
    });
    const [requestError, setRequestError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [preview, setPreview] = useState(null);
    const previewVersion = useRef(0);

    const updateField = (field, value) => {
        setData(field, value);
        clearErrors(field);

        if (field === 'member_number' || field === 'isbn') {
            previewVersion.current += 1;
            setPreview(null);
            setPreviewing(false);
            setRequestError('');
        }
    };

    const checkPreview = async () => {
        const version = ++previewVersion.current;
        setPreview(null);
        setPreviewing(true);
        setRequestError('');
        clearErrors('member_number', 'isbn');

        try {
            const result = await jsonRequest({
                data: {
                    member_number: data.member_number,
                    isbn: data.isbn,
                },
                method: 'POST',
                url: route('staff.loans.preview'),
            });

            if (version === previewVersion.current) {
                setPreview(result);
            }
        } catch (error) {
            if (version !== previewVersion.current) {
                return;
            }

            const validationErrors = getLaravelValidationErrors(error);

            if (validationErrors) {
                setError(validationErrors);
            } else {
                setRequestError(
                    getRequestErrorMessage(
                        error,
                        'The member and book could not be checked. Try again.',
                    ),
                );
            }
        } finally {
            if (version === previewVersion.current) {
                setPreviewing(false);
            }
        }
    };

    const submit = async () => {
        if (!preview || preview.book.available_copies < 1 || previewing) {
            return;
        }

        clearErrors();
        setRequestError('');
        setSubmitting(true);

        try {
            const payload = await jsonRequest({
                data,
                method: 'POST',
                url: route('staff.loans.store'),
            });

            onSuccess(payload);
        } catch (error) {
            const validationErrors = getLaravelValidationErrors(error);

            if (validationErrors) {
                setError(validationErrors);
                setPreview(null);
            } else {
                setRequestError(
                    getRequestErrorMessage(
                        error,
                        'The loan could not be issued. Try again.',
                    ),
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card
            className="loan-form-card"
            extra={
                <Typography.Text type="secondary">
                    All fields are required
                </Typography.Text>
            }
            title="Loan details"
        >
            <Alert
                className="loan-form-note"
                description="Enter the member number and book ISBN, check the match, then choose a due date and issue the loan."
                showIcon
                title="At the circulation desk"
                type="info"
            />

            <Form layout="vertical" onFinish={submit} requiredMark>
                {requestError && (
                    <Alert
                        className="form-request-alert"
                        showIcon
                        title={requestError}
                        type="error"
                    />
                )}

                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <Form.Item
                            help={
                                errors.member_number ??
                                'Enter the number printed on the member card.'
                            }
                            htmlFor="member_number"
                            label="Member number"
                            required
                            validateStatus={errorStatus(errors.member_number)}
                        >
                            <Input
                                autoComplete="off"
                                autoFocus
                                id="member_number"
                                maxLength={255}
                                name="member_number"
                                onChange={(event) =>
                                    updateField(
                                        'member_number',
                                        event.target.value,
                                    )
                                }
                                placeholder="For example, MEM000123"
                                prefix={<IdcardOutlined />}
                                value={data.member_number}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            help={
                                errors.isbn ??
                                'Enter the 13-character ISBN on the book.'
                            }
                            htmlFor="isbn"
                            label="Book ISBN"
                            required
                            validateStatus={errorStatus(errors.isbn)}
                        >
                            <Input
                                autoComplete="off"
                                id="isbn"
                                inputMode="numeric"
                                maxLength={13}
                                name="isbn"
                                onChange={(event) =>
                                    updateField('isbn', event.target.value)
                                }
                                placeholder="9780132350884"
                                prefix={<BarcodeOutlined />}
                                spellCheck={false}
                                value={data.isbn}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            help={
                                errors.due_at ??
                                'Choose a future date for the return.'
                            }
                            htmlFor="due_at"
                            label="Due date"
                            required
                            validateStatus={errorStatus(errors.due_at)}
                        >
                            <DatePicker
                                className="w-full"
                                disabledDate={(current) =>
                                    current.isBefore(
                                        dayjs().add(1, 'day').startOf('day'),
                                    )
                                }
                                format="DD MMM YYYY"
                                id="due_at"
                                name="due_at"
                                onChange={(date) =>
                                    updateField(
                                        'due_at',
                                        date ? date.format('YYYY-MM-DD') : '',
                                    )
                                }
                                placeholder="Select a due date"
                                value={
                                    data.due_at
                                        ? dayjs(data.due_at, 'YYYY-MM-DD')
                                        : null
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Flex className="mb-5" gap={8} justify="flex-start" wrap>
                    <Button
                        disabled={!data.member_number || !data.isbn || submitting}
                        loading={previewing}
                        onClick={checkPreview}
                        type="default"
                    >
                        Check member and book
                    </Button>
                </Flex>

                {preview && (
                    <Alert
                        className="mb-5"
                        description={
                            <div>
                                <div>
                                    <strong>Member:</strong> {preview.member.name} ({preview.member.member_number})
                                </div>
                                <div>
                                    <strong>Book:</strong> {preview.book.title} ({preview.book.isbn})
                                </div>
                                <div>
                                    <strong>Available copies:</strong> {preview.book.available_copies}
                                </div>
                                <Typography.Text type="secondary">
                                    Availability and borrowing eligibility are checked again when you issue.
                                </Typography.Text>
                            </div>
                        }
                        role="status"
                        showIcon
                        title={preview.book.available_copies > 0 ? 'Match confirmed' : 'No copies available'}
                        type={preview.book.available_copies > 0 ? 'success' : 'warning'}
                    />
                )}

                <Flex className="form-actions" gap={8} justify="flex-end" wrap>
                    <InertiaButton href={route('staff.loans.index')}>
                        Cancel
                    </InertiaButton>
                    <Button
                        disabled={!preview || preview.book.available_copies < 1 || previewing}
                        htmlType="submit"
                        loading={submitting}
                        type="primary"
                    >
                        Issue loan
                    </Button>
                </Flex>
            </Form>
        </Card>
    );
}
