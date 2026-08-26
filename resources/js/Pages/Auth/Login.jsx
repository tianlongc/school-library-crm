import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Alert, Button, Checkbox, Flex, Form, Input } from 'antd';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = () => {
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            title="Welcome back"
            description="Members and library staff use this same sign-in to reach their account."
        >
            <Head title="Log in" />

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

                <Form.Item
                    htmlFor="password"
                    label="Password"
                    validateStatus={errors.password ? 'error' : undefined}
                    help={errors.password}
                >
                    <Input.Password
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                    />
                </Form.Item>

                <Form.Item>
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(event) =>
                            setData('remember', event.target.checked)
                        }
                    >
                        Remember me
                    </Checkbox>
                </Form.Item>

                <Flex align="center" justify="space-between" gap={16} wrap>
                    {canResetPassword ? (
                        <Link href={route('password.request')} prefetch>
                            Forgot your password?
                        </Link>
                    ) : (
                        <span />
                    )}
                    <Button htmlType="submit" loading={processing} type="primary">
                        Log in
                    </Button>
                </Flex>
            </Form>
        </GuestLayout>
    );
}
