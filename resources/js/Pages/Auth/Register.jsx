import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, Flex, Form, Input } from 'antd';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = () => {
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            title="Create a member account"
            description="Public registration creates a library member account. Staff access is assigned separately by an administrator."
        >
            <Head title="Register" />

            <Form layout="vertical" onFinish={submit} requiredMark={false}>
                <Form.Item
                    htmlFor="name"
                    label="Name"
                    validateStatus={errors.name ? 'error' : undefined}
                    help={errors.name}
                >
                    <Input
                        id="name"
                        name="name"
                        autoComplete="name"
                        autoFocus
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                    />
                </Form.Item>

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

                <Flex align="center" justify="space-between" gap={16} wrap>
                    <Link href={route('login')} prefetch>
                        Already registered?
                    </Link>
                    <Button htmlType="submit" loading={processing} type="primary">
                        Create account
                    </Button>
                </Flex>
            </Form>
        </GuestLayout>
    );
}
