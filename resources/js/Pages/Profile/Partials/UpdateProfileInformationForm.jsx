import { Link, useForm, usePage } from '@inertiajs/react';
import { Alert, Button, Flex, Form, Input, Typography } from 'antd';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = () => {
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <Typography.Title level={3}>Profile information</Typography.Title>
            <Typography.Paragraph type="secondary">
                Update your name and account email address.
            </Typography.Paragraph>

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

                {mustVerifyEmail && user.email_verified_at === null && (
                    <Alert
                        className="profile-verification-alert"
                        type="warning"
                        title="Your email address is unverified"
                        description={
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                            >
                                Send another verification email
                            </Link>
                        }
                        showIcon
                    />
                )}

                {status === 'verification-link-sent' && (
                    <Alert
                        className="profile-verification-alert"
                        type="success"
                        title="Verification email sent"
                        showIcon
                    />
                )}

                <Flex align="center" gap={12} wrap>
                    <Button htmlType="submit" loading={processing} type="primary">
                        Save changes
                    </Button>
                    {recentlySuccessful && (
                        <Typography.Text type="success" role="status" aria-live="polite">
                            Profile updated.
                        </Typography.Text>
                    )}
                </Flex>
            </Form>
        </section>
    );
}
