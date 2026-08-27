import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Alert, Button, Form, Input } from 'antd';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = () => {
        post(route('password.email'));
    };

    return (
        <GuestLayout
            title="Reset your password"
            description="We will send a secure reset link to your account email."
        >
            <Head title="Forgot Password" />

            {status && (
                <Alert className="auth-alert" type="success" title={status} showIcon />
            )}

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
                        autoFocus
                        spellCheck={false}
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                    />
                </Form.Item>

                <Button block htmlType="submit" loading={processing} type="primary">
                    Send reset link
                </Button>
            </Form>
        </GuestLayout>
    );
}
