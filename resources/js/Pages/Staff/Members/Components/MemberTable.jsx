import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import PauseCircleOutlined from '@ant-design/icons/PauseCircleOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';
import { Badge, Button, Space, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';
import ServerDataTable from '@/Components/Tables/ServerDataTable';
import MobileRecord from '@/Components/Tables/MobileRecord';
import { getSortOrder } from '@/Components/Tables/tableQuery';

const memberStatusBadgeStatuses = {
    active: 'success',
    suspended: 'warning',
    inactive: 'default',
};

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
});

function MemberActions({ member, can, onTransition, compact = false }) {
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
                >
                    {compact ? 'Suspend' : null}
                </Button>
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
                >
                    {compact ? 'Deactivate' : null}
                </Button>
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
                >
                    {compact ? 'Reactivate' : null}
                </Button>
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
            align: 'center',
            sorter: true,
            sortOrder: getSortOrder(filters, 'member_number'),
            width: 170,
            render: (memberNumber) => (
                <span className="table-meta-chip">
                    {memberNumber}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: (status) => (
                <Badge
                    status={memberStatusBadgeStatuses[status] ?? 'default'}
                    text={status.charAt(0).toUpperCase() + status.slice(1)}    
                />
            ),
        },
        {
            title: 'Joined',
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
            mobileSort={filters}
            mobileRenderItem={(member) => (
                <MobileRecord
                    title={member.name}
                    subtitle={member.email}
                    status={<Badge status={memberStatusBadgeStatuses[member.status] ?? 'default'} text={member.status.charAt(0).toUpperCase() + member.status.slice(1)} />}
                    details={[
                        { label: 'Member number', value: member.member_number },
                        { label: 'Joined', value: member.created_at ? dateFormatter.format(new Date(member.created_at)) : '—' },
                    ]}
                    actions={<MemberActions member={member} can={can} onTransition={onTransition} compact />}
                />
            )}
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
