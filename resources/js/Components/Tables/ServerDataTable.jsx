import { Empty, Flex, Pagination, Table, Typography } from 'antd';
import { PAGE_SIZE_OPTIONS } from './tableQuery';

export default function ServerDataTable({
    columns,
    data,
    emptyText,
    loading,
    meta,
    onPageChange,
    onTableChange,
    pluralName,
    rowClassName,
    rowKey = 'id',
    scrollX = 900,
    showQuickJumper = true,
    singularName,
}) {
    const firstItem = meta.from ?? 0;
    const lastItem = meta.to ?? 0;
    const itemName = meta.total === 1 ? singularName : pluralName;

    return (
        <>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                locale={{
                    emptyText: (
                        <Empty
                            description={emptyText}
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ),
                }}
                pagination={false}
                rowClassName={rowClassName}
                rowKey={rowKey}
                scroll={{ x: scrollX }}
                sortDirections={['ascend', 'descend', 'ascend']}
                showSorterTooltip={{
                    target: 'sorter-icon',
                }}
                size="middle"
                onChange={onTableChange}
            />

            {meta.total > 0 && (
                <Flex
                    align="center"
                    className="table-pagination"
                    gap={16}
                    justify="space-between"
                    wrap
                >
                    <Typography.Text type="secondary">
                        Showing {firstItem}–{lastItem} of {meta.total}{' '}
                        {itemName}
                    </Typography.Text>

                    <Pagination
                        current={meta.current_page}
                        pageSize={meta.per_page}
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        responsive
                        showQuickJumper={showQuickJumper}
                        showSizeChanger={{
                            showSearch: false,
                         }}
                        showTitle
                        total={meta.total}
                        onChange={onPageChange}
                    />
                </Flex>
            )}
        </>
    );
}
