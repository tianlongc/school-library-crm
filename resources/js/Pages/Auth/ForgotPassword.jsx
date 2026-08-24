import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout
            title="Reset your password"
            description="We will send a secure reset link to your account email."
        >
            <Head title="Forgot Password" />

            {status && (
                <div
                    className="ui-alert mb-5 border-emerald-200 bg-emerald-50 text-emerald-800"
                    role="status"
                >
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <InputLabel htmlFor="email" value="Email" />

                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    autoComplete="username"
                    spellCheck="false"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="mt-6 flex items-center justify-end">
                    <PrimaryButton disabled={processing}>
                        Send reset link
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
