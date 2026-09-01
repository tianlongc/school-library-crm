import InertiaButton from '@/Components/InertiaButton';
import ServerDataTable from '@/Components/Tables/ServerDataTable';
import { getSortOrder } from '@/Components/Tables/tableQuery';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import TagsOutlined from '@ant-design/icons/TagsOutlined';
import { Button, Flex, Space, Tag, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
});

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
    filters,
    loading,
    meta,
    onDelete,
    onPageChange,
    onTableChange,
}) {
    const columns = useMemo(() => [
        {
            title: 'Category',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder: getSortOrder(filters, 'name'),
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
            title: 'Created',
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
    ], [filters, onDelete]);

    const emptyText = filters.search?.trim()
        ? 'No categories match this search.'
        : 'No categories have been added yet.';

    return (
        <ServerDataTable
            columns={columns}
            data={categories}
            emptyText={emptyText}
            loading={loading}
            meta={meta}
            pluralName="categories"
            scrollX={780}
            singularName="category"
            onPageChange={onPageChange}
            onTableChange={onTableChange}
        />
    );
}
