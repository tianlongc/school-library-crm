import { useForm } from '@inertiajs/react';
import { Button, Flex, Form, Input, Typography } from 'antd';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = () => {
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (responseErrors) => {
                if (responseErrors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (responseErrors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <Typography.Title level={3}>Update password</Typography.Title>
            <Typography.Paragraph type="secondary">
                Use a long, unique password to keep your account secure.
            </Typography.Paragraph>

            <Form layout="vertical" onFinish={updatePassword} requiredMark={false}>
                <Form.Item
                    htmlFor="current_password"
                    label="Current password"
                    validateStatus={errors.current_password ? 'error' : undefined}
                    help={errors.current_password}
                >
                    <Input.Password
                        id="current_password"
                        name="current_password"
                        ref={currentPasswordInput}
                        autoComplete="current-password"
                        value={data.current_password}
                        onChange={(event) =>
                            setData('current_password', event.target.value)
                        }
                    />
                </Form.Item>

                <Form.Item
                    htmlFor="password"
                    label="New password"
                    validateStatus={errors.password ? 'error' : undefined}
                    help={errors.password}
                >
                    <Input.Password
                        id="password"
                        name="password"
                        ref={passwordInput}
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                    />
                </Form.Item>

                <Form.Item
                    htmlFor="password_confirmation"
                    label="Confirm password"
                    validateStatus={
                        errors.password_confirmation ? 'error' : undefined
                    }
                    help={errors.password_confirmation}
                >
                    <Input.Password
                        id="password_confirmation"
                        name="password_confirmation"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(event) =>
                            setData('password_confirmation', event.target.value)
                        }
                    />
                </Form.Item>

                <Flex align="center" gap={12} wrap>
                    <Button htmlType="submit" loading={processing} type="primary">
                        Save changes
                    </Button>
                    {recentlySuccessful && (
                        <Typography.Text type="success" role="status" aria-live="polite">
                            Password updated.
                        </Typography.Text>
                    )}
                </Flex>
            </Form>
        </section>
    );
}
