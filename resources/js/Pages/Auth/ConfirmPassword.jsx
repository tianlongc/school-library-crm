import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button, Form, Input } from 'antd';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = () => {
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            title="Confirm your password"
            description="This secure area needs a quick password check before you continue."
        >
            <Head title="Confirm Password" />

            <Form layout="vertical" onFinish={submit} requiredMark={false}>
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
                        autoFocus
                        value={data.password}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                    />
                </Form.Item>

                <Button block htmlType="submit" loading={processing} type="primary">
                    Confirm
                </Button>
            </Form>
        </GuestLayout>
    );
}
