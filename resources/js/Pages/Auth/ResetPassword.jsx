import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button, Form, Input } from 'antd';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = () => {
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            title="Choose a new password"
            description="Use a strong password that you do not reuse elsewhere."
        >
            <Head title="Reset Password" />

            <Form layout="vertical" onFinish={submit} requiredMark={false}>
                <Form.Item
                    htmlFor="email"
                    label="Email"
                    validateStatus={errors.email ? 'error' : undefined}
                    help={errors.email}
                >
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        spellCheck={false}
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    htmlFor="password"
                    label="Password"
                    validateStatus={errors.password ? 'error' : undefined}
                    help={errors.password}
                >
                    <Input.Password
                        id="password"
                        name="password"
                        autoComplete="new-password"
                        autoFocus
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

                <Button block htmlType="submit" loading={processing} type="primary">
                    Reset password
                </Button>
            </Form>
        </GuestLayout>
    );
}
