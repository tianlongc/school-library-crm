import { Button, Empty, Flex, Pagination, Select, Spin, Table, Typography } from 'antd';
import { PAGE_SIZE_OPTIONS } from './tableQuery';

export default function ServerDataTable({
    columns,
    data,
    emptyText,
    loading,
    meta,
    mobileRenderItem,
    mobileSort,
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
    const sortableColumns = columns.filter((column) => column.sorter);
    const selectedSort = sortableColumns.find((column) => column.key === mobileSort?.sort);
    const mobileSortOptions = sortableColumns.map((column) => ({
        label: typeof column.title === 'string' ? column.title : column.key,
        value: column.key,
    }));
    const applyMobileSort = (columnKey, direction) => {
        onTableChange(null, null, {
            columnKey,
            order: direction === 'asc' ? 'ascend' : 'descend',
        }, { action: 'sort' });
    };

    return (
        <>
            {mobileRenderItem && sortableColumns.length > 0 && (
                <Flex className="mobile-directory-sort" align="center" gap={8} wrap>
                    <Typography.Text>Sort by</Typography.Text>
                    <Select
                        aria-label="Sort records by"
                        className="mobile-directory-sort-select"
                        options={mobileSortOptions}
                        value={selectedSort?.key}
                        onChange={(columnKey) => applyMobileSort(columnKey, mobileSort?.direction ?? 'desc')}
                    />
                    <Button
                        aria-label={`Sort ${mobileSort?.direction === 'asc' ? 'descending' : 'ascending'}`}
                        onClick={() => applyMobileSort(mobileSort?.sort ?? sortableColumns[0].key, mobileSort?.direction === 'asc' ? 'desc' : 'asc')}
                    >
                        {mobileSort?.direction === 'asc' ? 'Ascending' : 'Descending'}
                    </Button>
                </Flex>
            )}

            {mobileRenderItem && (
                <div className="mobile-directory-list" aria-busy={loading}>
                    <span className="sr-only" role="status" aria-live="polite">
                        {loading
                            ? 'Updating results.'
                            : `Showing ${data.length} ${data.length === 1 ? singularName : pluralName}.`}
                    </span>
                    {loading && (
                        <div className="mobile-directory-loading">
                            <Spin size="small" />
                            <span>Updating results…</span>
                        </div>
                    )}
                    {data.length > 0 ? (
                        <ul inert={loading ? true : undefined}>
                            {data.map((item) => (
                                <li key={typeof rowKey === 'function' ? rowKey(item) : item[rowKey]}>
                                    {mobileRenderItem(item)}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </div>
            )}

            <Table
                className={mobileRenderItem ? 'desktop-directory-table' : undefined}
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
