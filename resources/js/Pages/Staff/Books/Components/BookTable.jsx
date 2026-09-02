import InertiaButton from '@/Components/InertiaButton';
import ServerDataTable from '@/Components/Tables/ServerDataTable';
import { getSortOrder } from '@/Components/Tables/tableQuery';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { Button, Space, Tag, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
});

function BookActions({ book, onDelete }) {
    return (
        <Space size={4} role="group" aria-label={`Actions for ${book.title}`}>
            <Tooltip title="View book">
                <InertiaButton
                    href={route('staff.books.show', book.id)}
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    aria-label={`View ${book.title}`}
                />
            </Tooltip>
            <Tooltip title="Edit book">
                <InertiaButton
                    href={route('staff.books.edit', book.id)}
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    aria-label={`Edit ${book.title}`}
                />
            </Tooltip>
            <Tooltip title="Delete book">
                <Button
                    danger
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(book)}
                    aria-label={`Delete ${book.title}`}
                />
            </Tooltip>
        </Space>
    );
}

export default function BookTable({
    books,
    filters,
    loading,
    meta,
    onDelete,
    onPageChange,
    onTableChange,
}) {
    const columns = useMemo(
        () => [
            {
                title: 'Book',
                dataIndex: 'title',
                key: 'title',
                sorter: true,
                sortOrder: getSortOrder(filters, 'title'),
                width: 300,
                render: (_, book) => (
                    <div className="min-w-0 py-1">
                        <InertiaButton
                            className="table-title-link"
                            href={route('staff.books.show', book.id)}
                            type="link"
                            size="small"
                        >
                            {book.title}
                        </InertiaButton>
                        <Typography.Text
                            className="table-secondary-line"
                            ellipsis
                            type="secondary"
                        >
                            {book.category?.name ?? 'Uncategorized'}
                        </Typography.Text>
                    </div>
                ),
            },
            {
                title: 'Author',
                dataIndex: 'author',
                key: 'author',
                width: 220,
                sorter: true,
                sortOrder: getSortOrder(filters, 'author'),
                ellipsis: true,
            },
            {
                title: 'ISBN',
                dataIndex: 'isbn',
                key: 'isbn',
                sorter: true,
                sortOrder: getSortOrder(filters, 'isbn'),
                width: 150,
                render: (isbn) => (
                    <Typography.Text code>{isbn}</Typography.Text>
                ),
            },
            {
                title: 'Availability',
                key: 'availability',
                align: 'center',
                width: 160,
                render: (_, book) => {
                    const isAvailable = book.available_copies > 0;

                    return (
                        <Space orientation="vertical" size={2}>
                            <Tag color={isAvailable ? 'success' : 'error'}>
                                {isAvailable
                                    ? `${book.available_copies} available`
                                    : 'Unavailable'}
                            </Tag>

                            <Typography.Text type="secondary">
                                {book.total_copies} total
                            </Typography.Text>
                        </Space>
                    );
                },
            },
            {
                title: 'Added',
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
                width: 120,
                render: (_, book) => (
                    <BookActions book={book} onDelete={onDelete} />
                ),
            },
        ],
        [filters, onDelete],
    );

    const emptyText = filters.search?.trim()
        ? 'No books match this search.'
        : 'No books have been added yet.';

    return (
        <ServerDataTable
            columns={columns}
            data={books}
            emptyText={emptyText}
            loading={loading}
            meta={meta}
            pluralName="books"
            scrollX={1100}
            singularName="book"
            onPageChange={onPageChange}
            onTableChange={onTableChange}
        />
    );
}
