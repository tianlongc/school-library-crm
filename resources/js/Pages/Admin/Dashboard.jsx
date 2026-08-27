import PageHeader from '@/Components/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Head, router } from '@inertiajs/react';
import {
    App as AntdApp,
    Card,
    Flex,
    Input,
    Modal,
    Select,
    Typography,
} from 'antd';
import { useState } from 'react';
import UserTable from './Components/UserTable';

export default function Dashboard({ users, filters, roles }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [loading, setLoading] = useState(false);
    const [savingRole, setSavingRole] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const { message } = AntdApp.useApp();

    const visitUsers = ({
        search: nextSearch = filters.search ?? '',
        role: nextRole = filters.role ?? '',
        page,
    } = {}) => {
        const parameters = {};

        if (nextSearch.trim()) {
            parameters.search = nextSearch.trim();
        }

        if (nextRole) {
            parameters.role = nextRole;
        }

        if (page) {
            parameters.page = page;
        }

        router.get(route('admin.dashboard'), parameters, {
            preserveState: true,
            replace: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };

    const openRoleModal = (user) => {
        setSelectedUser(user);
        setSelectedRole(user.roles[0] ?? '');
    };

    const closeRoleModal = () => {
        if (savingRole) {
            return;
        }

        setSelectedUser(null);
        setSelectedRole('');
    };

    const updateRole = async () => {
        if (!selectedUser || !selectedRole) {
            return;
        }

        setSavingRole(true);

        try {
            const response = await jsonRequest({
                url: route('admin.users.role.update', selectedUser.id),
                method: 'POST',
                data: { role: selectedRole },
            });

            message.success(response.message);
            setSelectedUser(null);
            setSelectedRole('');
            router.reload({ only: ['users'] });
        } catch (error) {
            message.error(
                error.errors?.role?.[0] ??
                    getRequestErrorMessage(
                        error,
                        'The user role could not be updated. Try again.',
                    ),
            );
        } finally {
            setSavingRole(false);
        }
    };

    const selectableRoles = roles.map((role) => ({
        ...role,
        disabled:
            role.value === 'member' && selectedUser?.member === null,
    }));

    return (
        <AdminLayout title="User management">
            <Head title="User management" />

            <PageHeader
                eyebrow="Administration"
                title="User management"
                description="Review library accounts and keep access roles aligned with each person’s responsibilities."
            />

            <Card
                className="directory-card"
                title={
                    <span>
                        Account directory
                        <Typography.Text
                            type="secondary"
                            className="directory-count"
                        >
                            {users.meta.total} total
                        </Typography.Text>
                    </span>
                }
                extra={
                    <Flex gap={8} wrap>
                        <Select
                            aria-label="Filter users by role"
                            options={[
                                { value: '', label: 'All roles' },
                                ...roles,
                            ]}
                            value={filters.role ?? ''}
                            onChange={(role) =>
                                visitUsers({ search, role })
                            }
                            style={{ minWidth: 150 }}
                        />

                        <Input.Search
                            allowClear
                            aria-label="Search users"
                            enterButton={<SearchOutlined />}
                            placeholder="Name, email or member number"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            onSearch={(value) =>
                                visitUsers({
                                    search: value,
                                    role: filters.role,
                                })
                            }
                        />
                    </Flex>
                }
                styles={{ body: { padding: 0 } }}
            >
                <UserTable
                    filtered={Boolean(
                        filters.search?.trim() || filters.role,
                    )}
                    loading={loading}
                    meta={users.meta}
                    roleOptions={roles}
                    users={users.data}
                    onEditRole={openRoleModal}
                    onPageChange={(page) =>
                        visitUsers({
                            search: filters.search,
                            role: filters.role,
                            page,
                        })
                    }
                />
            </Card>

            <Modal
                title="Change access role"
                open={selectedUser !== null}
                okText="Update role"
                cancelText="Cancel"
                confirmLoading={savingRole}
                destroyOnHidden
                okButtonProps={{
                    disabled:
                        !selectedRole ||
                        selectedRole === selectedUser?.roles[0],
                }}
                onCancel={closeRoleModal}
                onOk={updateRole}
            >
                <Typography.Paragraph type="secondary">
                    Choose the single workspace role for{' '}
                    <Typography.Text strong>
                        {selectedUser?.name}
                    </Typography.Text>
                    .
                </Typography.Paragraph>

                <Select
                    aria-label={`Role for ${selectedUser?.name ?? 'user'}`}
                    options={selectableRoles}
                    placeholder="Select a role"
                    value={selectedRole || undefined}
                    onChange={setSelectedRole}
                    style={{ width: '100%' }}
                />

                {selectedUser?.member === null && (
                    <Typography.Paragraph
                        type="secondary"
                        className="planned-capability-copy"
                    >
                        The member role is unavailable because this account has
                        no Member borrowing profile.
                    </Typography.Paragraph>
                )}
            </Modal>
        </AdminLayout>
    );
}
