import InertiaButton from '@/Components/InertiaButton';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { Button, Empty, Flex, Pagination, Space, Table, Tag, Tooltip, Typography } from 'antd';

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
    loading,
    meta,
    onDelete,
    onPageChange,
    search,
}) {
    const columns = [
        {
            title: 'Book',
            key: 'book',
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
                    <Typography.Text type="secondary" ellipsis className="table-secondary-line">
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
            ellipsis: true,
        },
        {
            title: 'ISBN',
            dataIndex: 'isbn',
            key: 'isbn',
            width: 150,
            render: (isbn) => <Typography.Text code>{isbn}</Typography.Text>,
        },
        {
            title: 'Copies',
            dataIndex: 'total_copies',
            key: 'total_copies',
            align: 'center',
            width: 100,
            render: (copies) => <Tag>{copies} total</Tag>,
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            fixed: 'right',
            width: 120,
            render: (_, book) => <BookActions book={book} onDelete={onDelete} />,
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={books}
                loading={loading}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                search?.trim()
                                    ? 'No books match this search.'
                                    : 'No books have been added yet.'
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
                <Flex className="table-pagination" align="center" justify="space-between" gap={16} wrap>
                    <Typography.Text type="secondary">
                        {meta.total} {meta.total === 1 ? 'book' : 'books'}
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
