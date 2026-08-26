import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import PauseCircleOutlined from '@ant-design/icons/PauseCircleOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';
import { Button, Empty, Flex, Pagination, Space, Table, Tag, Tooltip, Typography } from 'antd';

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
            <Tooltip title="Deactivate member" key="deactivate">
                <Button
                    danger
                    type="text"
                    size="small"
                    icon={<StopOutlined />}
                    aria-label={`Deactivate ${member.name}`}
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
    loading,
    members,
    meta,
    onPageChange,
    onTransition,
    search,
}) {
    const columns = [
        {
            title: 'Member',
            key: 'member',
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
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={members}
                loading={loading}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                search?.trim()
                                    ? 'No members match these filters.'
                                    : 'No member accounts were found.'
                            }
                        />
                    ),
                }}
                pagination={false}
                rowKey="id"
                scroll={{ x: 900 }}
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
                        {meta.total}{' '}
                        {meta.total === 1 ? 'member' : 'members'}
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