import { useForm } from '@inertiajs/react';
import { Button, Flex, Form, Input, Modal, Typography } from 'antd';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();
    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    const deleteUser = () => {
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: closeModal,
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <section className={className}>
            <Typography.Title level={3} type="danger">
                Delete account
            </Typography.Title>
            <Typography.Paragraph type="secondary">
                Permanently remove your account and its associated data. This action
                cannot be undone.
            </Typography.Paragraph>

            <Button danger onClick={() => setConfirmingUserDeletion(true)}>
                Delete account
            </Button>

            <Modal
                destroyOnHidden
                footer={null}
                onCancel={closeModal}
                open={confirmingUserDeletion}
                title="Delete your account?"
            >
                <Typography.Paragraph type="secondary">
                    Enter your password to confirm permanent account deletion.
                </Typography.Paragraph>

                <Form layout="vertical" onFinish={deleteUser} requiredMark={false}>
                    <Form.Item
                        htmlFor="delete-account-password"
                        label="Password"
                        validateStatus={errors.password ? 'error' : undefined}
                        help={errors.password}
                    >
                        <Input.Password
                            id="delete-account-password"
                            name="password"
                            ref={passwordInput}
                            autoComplete="current-password"
                            autoFocus
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                        />
                    </Form.Item>

                    <Flex justify="flex-end" gap={8} wrap>
                        <Button onClick={closeModal}>Cancel</Button>
                        <Button
                            danger
                            htmlType="submit"
                            loading={processing}
                            type="primary"
                        >
                            Delete account
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        </section>
    );
}
