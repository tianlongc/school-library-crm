import UserSwitchOutlined from '@ant-design/icons/UserSwitchOutlined';
import {
    Button,
    Empty,
    Flex,
    Pagination,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
} from 'antd';

const roleColors = {
    admin: 'purple',
    librarian: 'blue',
    member: 'cyan',
};

const memberStatusColors = {
    active: 'success',
    suspended: 'warning',
    inactive: 'default',
};

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
});

function UserActions({ user, onEditRole }) {
    if (user.is_current_user) {
        return (
            <Typography.Text type="secondary">
                Current account
            </Typography.Text>
        );
    }

    if (!user.can.update_role) {
        return <Typography.Text type="secondary">—</Typography.Text>;
    }

    return (
        <Tooltip title="Change access role">
            <Button
                type="text"
                size="small"
                icon={<UserSwitchOutlined />}
                aria-label={`Change role for ${user.name}`}
                onClick={() => onEditRole(user)}
            />
        </Tooltip>
    );
}

export default function UserTable({
    filtered,
    loading,
    meta,
    onEditRole,
    onPageChange,
    roleOptions,
    users,
}) {
    const roleLabels = Object.fromEntries(
        roleOptions.map((role) => [role.value, role.label]),
    );

    const columns = [
        {
            title: 'Account',
            key: 'account',
            width: 280,
            render: (_, user) => (
                <div className="min-w-0 py-1">
                    <Typography.Text strong>{user.name}</Typography.Text>
                    <Typography.Text
                        type="secondary"
                        className="table-secondary-line"
                    >
                        {user.email}
                    </Typography.Text>
                </div>
            ),
        },
        {
            title: 'Access role',
            dataIndex: 'roles',
            key: 'roles',
            width: 190,
            render: (roles) =>
                roles.length > 0 ? (
                    <Space size={[4, 4]} wrap>
                        {roles.map((role) => (
                            <Tag color={roleColors[role]} key={role}>
                                {roleLabels[role] ?? role}
                            </Tag>
                        ))}
                    </Space>
                ) : (
                    <Tag>Unassigned</Tag>
                ),
        },
        {
            title: 'Member profile',
            dataIndex: 'member',
            key: 'member',
            width: 190,
            render: (member) =>
                member ? (
                    <div>
                        <Typography.Text code>
                            {member.member_number}
                        </Typography.Text>
                        <Typography.Text className="table-secondary-line">
                            <Tag color={memberStatusColors[member.status]}>
                                {member.status.charAt(0).toUpperCase() +
                                    member.status.slice(1)}
                            </Tag>
                        </Typography.Text>
                    </div>
                ) : (
                    <Typography.Text type="secondary">
                        Not linked
                    </Typography.Text>
                ),
        },
        {
            title: 'Email',
            dataIndex: 'email_verified',
            key: 'email_verified',
            align: 'center',
            width: 130,
            render: (verified) => (
                <Tag color={verified ? 'success' : 'warning'}>
                    {verified ? 'Verified' : 'Unverified'}
                </Tag>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (createdAt) =>
                createdAt
                    ? dateFormatter.format(new Date(createdAt))
                    : '—',
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            fixed: 'right',
            width: 150,
            render: (_, user) => (
                <UserActions user={user} onEditRole={onEditRole} />
            ),
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={users}
                loading={loading}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                filtered
                                    ? 'No accounts match these filters.'
                                    : 'No user accounts were found.'
                            }
                        />
                    ),
                }}
                pagination={false}
                rowKey="id"
                scroll={{ x: 1050 }}
                size="middle"
            />

            {meta.total > 0 && (
                <Flex
                    className="table-pagination"
                    align="center"
                    justify="space-between"
                    gap={16}
                    wrap
                >
                    <Typography.Text type="secondary">
                        {meta.total} {meta.total === 1 ? 'account' : 'accounts'}
                    </Typography.Text>

                    <Pagination
                        current={meta.current_page}
                        pageSize={meta.per_page}
                        total={meta.total}
                        showSizeChanger={false}
                        showTitle
                        onChange={onPageChange}
                    />
                </Flex>
            )}
        </>
    );
}
