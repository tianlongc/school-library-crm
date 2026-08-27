import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Alert, Button, Flex } from 'antd';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    return (
        <GuestLayout
            title="Verify your email"
            description="Open the verification link we sent before entering the library workspace."
        >
            <Head title="Email Verification" />

            <Alert
                className="auth-alert"
                type="info"
                title="Check your inbox"
                description="If the message has not arrived, check your spam folder or send another verification email."
                showIcon
            />

            {status === 'verification-link-sent' && (
                <Alert
                    className="auth-alert"
                    type="success"
                    title="Verification email sent"
                    description="A new verification link has been sent to the email address you provided during registration."
                    showIcon
                />
            )}

            <Flex align="center" justify="space-between" gap={16} wrap>
                <Button
                    type="primary"
                    loading={processing}
                    onClick={() => post(route('verification.send'))}
                >
                    Resend verification email
                </Button>

                <Link href={route('logout')} method="post" as="button">
                    Log out
                </Link>
            </Flex>
        </GuestLayout>
    );
}
