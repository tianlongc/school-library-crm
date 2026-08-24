import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout
            title="Verify your email"
            description="Open the verification link we sent before entering the library workspace."
        >
            <Head title="Email Verification" />

            <div className="ui-alert mb-5">
                If the message has not arrived, check your spam folder or send
                another verification email.
            </div>

            {status === 'verification-link-sent' && (
                <div
                    className="ui-alert mb-5 border-emerald-200 bg-emerald-50 text-emerald-800"
                    role="status"
                >
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <PrimaryButton disabled={processing}>
                        Resend Verification Email
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="ui-action-link text-sm"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
