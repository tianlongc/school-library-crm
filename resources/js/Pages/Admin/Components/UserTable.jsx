import ServerDataTable from '@/Components/Tables/ServerDataTable';
import { getSortOrder } from '@/Components/Tables/tableQuery';
import { ReadOutlined, SafetyCertificateOutlined, UserOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { Badge, Button, Space, Tag, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';

const rolePresentation = {
    admin: {
        icon: SafetyCertificateOutlined,
        className: 'is-admin',
    },
    librarian: {
        icon: ReadOutlined,
        className: 'is-librarian',
    },
    member: {
        icon: UserOutlined,
        className: 'is-member',
    },
};

const memberStatusBadgeStatuses = {
    active: 'success',
    suspended: 'warning',
    inactive: 'default',
};

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
});

function RoleTag({ role, label }) {
    const presentation = rolePresentation[role] ?? {
        icon: UserOutlined,
        className: 'is-default',
    };

    const RoleIcon = presentation.icon;

    return (
        <Tag
            className={`table-role-tag ${presentation.className}`}
            icon={<RoleIcon />}
        >
            {label}
        </Tag>
    );
}

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
    filters,
    loading,
    meta,
    onEditRole,
    onPageChange,
    onTableChange,
    roleOptions,
    users,
}) {
    const roleLabels = useMemo(
        () =>
            Object.fromEntries(
                roleOptions.map((role) => [role.value, role.label]),
            ),
        [roleOptions],
    );

    const columns = useMemo(() => [
        {
            title: 'Account',
            key: 'name',
            sorter: true,
            sortOrder: getSortOrder(filters, 'name'),
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
            align: 'center',
            width: 190,
            render: (roles) =>
                roles.length > 0 ? (
                    <Space size={[6, 6]} wrap>
                        {roles.map((role) => (
                            <RoleTag
                                key={role}
                                role={role}
                                label={roleLabels[role] ?? role}
                            />
                        ))}
                    </Space>
                ) : (
                    <Tag className="table-role-tag is-default">
                        Unassigned
                    </Tag>
                ),
        },
        {
            title: 'Member profile',
            dataIndex: 'member',
            key: 'member_number',
            sorter: true,
            sortOrder: getSortOrder(filters, 'member_number'),
            width: 190,
            render: (member) =>
                member ? (
                    <div className="member-profile-cell">
                        <span className="member-profile-number">
                            {member.member_number}
                        </span>
                        
                        <Badge 
                            className="member-profile-status"
                            status={
                                memberStatusBadgeStatuses[member.status] ??
                                'default'
                            }
                            text={
                                member.status.charAt(0).toUpperCase() + member.status.slice(1)
                            }
                        />
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
                <Badge
                    status={verified ? 'success' : 'warning'}
                    text={verified ? 'Verified' : 'Unverified'}
                />
            ),
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            align: 'center',
            sorter: true,
            sortOrder: getSortOrder(filters, 'created_at'),
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
    ], [filters, onEditRole, roleLabels]);

    return (
        <ServerDataTable
            columns={columns}
            data={users}
            emptyText={
                filtered
                    ? 'No accounts match these filters.'
                    : 'No user accounts were found.'
            }
            loading={loading}
            meta={meta}
            pluralName="accounts"
            scrollX={1050}
            singularName="account"
            onPageChange={onPageChange}
            onTableChange={onTableChange}
        />
    );
}
