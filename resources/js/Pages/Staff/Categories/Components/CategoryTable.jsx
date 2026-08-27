import InertiaButton from '@/Components/InertiaButton';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import TagsOutlined from '@ant-design/icons/TagsOutlined';
import { Button, Empty, Flex, Pagination, Space, Table, Tag, Tooltip, Typography } from 'antd';

function CategoryActions({ category, onDelete }) {
    return (
        <Space size={4} role="group" aria-label={`Actions for ${category.name}`}>
            <Tooltip title="Edit category">
                <InertiaButton
                    href={route('staff.categories.edit', category.id)}
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    aria-label={`Edit ${category.name}`}
                />
            </Tooltip>
            <Tooltip title="Delete category">
                <Button
                    danger
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(category)}
                    aria-label={`Delete ${category.name}`}
                />
            </Tooltip>
        </Space>
    );
}

export default function CategoryTable({
    categories,
    loading,
    meta,
    onDelete,
    onPageChange,
    search,
}) {
    const columns = [
        {
            title: 'Category',
            dataIndex: 'name',
            key: 'name',
            render: (name) => (
                <Flex align="center" gap={12}>
                    <span className="table-entity-icon table-category-icon">
                        <TagsOutlined />
                    </span>
                    <Typography.Text strong>{name}</Typography.Text>
                </Flex>
            ),
        },
        {
            title: 'Catalogue',
            dataIndex: 'books_count',
            key: 'books_count',
            align: 'center',
            width: 180,
            render: (count) => (
                <Tag color="cyan">
                    {count} {count === 1 ? 'book' : 'books'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 120,
            render: (_, category) => (
                <CategoryActions category={category} onDelete={onDelete} />
            ),
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={categories}
                loading={loading}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                search?.trim()
                                    ? 'No categories match this search.'
                                    : 'No categories have been added yet.'
                            }
                        />
                    ),
                }}
                pagination={false}
                rowKey="id"
                scroll={{ x: 640 }}
                size="middle"
            />
            {meta.total > 0 && (
                <Flex className="table-pagination" align="center" justify="space-between" gap={16} wrap>
                    <Typography.Text type="secondary">
                        {meta.total} {meta.total === 1 ? 'category' : 'categories'}
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
