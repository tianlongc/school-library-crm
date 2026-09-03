import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import PauseCircleOutlined from '@ant-design/icons/PauseCircleOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';
import { Button, Space, Tag, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';
import ServerDataTable from '@/Components/Tables/ServerDataTable';
import { getSortOrder } from '@/Components/Tables/tableQuery';

const statusColors = {
    active: 'success',
    suspended: 'warning',
    inactive: 'default',
};

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
});

function MemberActions({ member, can, onTransition }) {
    const actions = [];

    if (member.status === 'active' && can.suspend) {
        actions.push(
            <Tooltip title="Suspend member" key="suspend">
                <Button
                    type="text"
                    size="small"
                    icon={<PauseCircleOutlined />}
                    aria-label={`Suspend ${member.name}`}
                    onClick={() => onTransition(member, 'suspend')}
                />
            </Tooltip>,
        );
    }

    if (member.status !== 'inactive' && can.deactivate) {
        actions.push(
            <Tooltip title="Deactivate membership" key="deactivate">
                <Button
                    danger
                    type="text"
                    size="small"
                    icon={<StopOutlined />}
                    aria-label={`Deactivate membership for ${member.name}`}
                    onClick={() => onTransition(member, 'deactivate')}
                />
            </Tooltip>,
        );
    }

    if (member.status !== 'active' && can.reactivate) {
        actions.push(
            <Tooltip title="Reactivate member" key="reactivate">
                <Button
                    type="text"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    aria-label={`Reactivate ${member.name}`}
                    onClick={() => onTransition(member, 'reactivate')}
                />
            </Tooltip>,
        );
    }

    return actions.length > 0 ? (
        <Space
            size={4}
            role="group"
            aria-label={`Actions for ${member.name}`}
        >
            {actions}
        </Space>
    ) : (
        <Typography.Text type="secondary">—</Typography.Text>
    );
}

export default function MemberTable({
    can,
    filters,
    loading,
    members,
    meta,
    onPageChange,
    onTableChange,
    onTransition,
}) {
    const columns = useMemo(() => [
        {
            title: 'Member',
            key: 'name',
            sorter: true,
            sortOrder: getSortOrder(filters, 'name'),
            width: 280,
            render: (_, member) => (
                <div className="min-w-0 py-1">
                    <Typography.Text strong>{member.name}</Typography.Text>
                    <Typography.Text
                        type="secondary"
                        className="table-secondary-line"
                    >
                        {member.email}
                    </Typography.Text>
                </div>
            ),
        },
        {
            title: 'Member number',
            dataIndex: 'member_number',
            key: 'member_number',
            sorter: true,
            sortOrder: getSortOrder(filters, 'member_number'),
            width: 170,
            render: (memberNumber) => (
                <Typography.Text code>{memberNumber}</Typography.Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 130,
            render: (status) => (
                <Tag color={statusColors[status]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Tag>
            ),
        },
        {
            title: 'Joined',
            dataIndex: 'created_at',
            key: 'created_at',
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
            width: 140,
            render: (_, member) => (
                <MemberActions
                    member={member}
                    can={can}
                    onTransition={onTransition}
                />
            ),
        },
    ], [can, filters, onTransition]);

    const isFiltered = Boolean(filters.search?.trim() || filters.status);

    return (
        <ServerDataTable
            columns={columns}
            data={members}
            emptyText={
                isFiltered
                    ? 'No members match these filters.'
                    : 'No member accounts were found.'
            }
            loading={loading}
            meta={meta}
            pluralName="members"
            singularName="member"
            onPageChange={onPageChange}
            onTableChange={onTableChange}
        />
    );
}