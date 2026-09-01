import InertiaButton from '@/Components/InertiaButton';
import PageHeader from '@/Components/PageHeader';
import TableSearchInput from '@/Components/Tables/TableSearchInput';
import { useServerTable } from '@/Components/Tables/useServerTable';
import StaffLayout from '@/Layouts/StaffLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { Head, router, usePage } from '@inertiajs/react';
import { App as AntdApp, Card, Flex, Select } from 'antd';
import LoanTable from './Components/LoanTable';

const statusOptions = [
    { value: '', label: 'All loans' },
    { value: 'active', label: 'Active' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'returned', label: 'Returned' },
];

export default function Index({ filters, loans }) {
    const { auth } = usePage().props;
    const { message, modal } = AntdApp.useApp();
    const {
        handlePageChange,
        handleTableChange,
        loading,
        search,
        setFilter,
        setSearch,
    } = useServerTable({
        filters,
        resource: 'loans',
        routeName: 'staff.loans.index',
    });

    const confirmReturn = (loan) => {
        modal.confirm({
            title: 'Return this book?',
            content: `${loan.book.title} will be checked in from ${loan.member.name}.`,
            okText: 'Return book',
            cancelText: 'Cancel',
            async onOk() {
                try {
                    const payload = await jsonRequest({
                        url: route('staff.loans.return', loan.id),
                        method: 'POST',
                    });

                    message.success(payload.message);
                    router.reload({ only: ['loans'] });
                } catch (error) {
                    message.error(
                        getRequestErrorMessage(
                            error,
                            'The book could not be returned. Try again.',
                        ),
                    );

                    throw error;
                }
            },
        });
    };

    return (
        <StaffLayout title="Loans">
            <Head title="Loans" />

            <PageHeader
                actions={
                    auth.can.issueLoans ? (
                        <InertiaButton
                            href={route('staff.loans.create')}
                            icon={<PlusOutlined />}
                            type="primary"
                        >
                            Issue loan
                        </InertiaButton>
                    ) : undefined
                }
                description="Issue books, watch due dates, and record returns from one circulation ledger."
                eyebrow="Circulation"
                title="Loans"
            />

            <Card
                className="directory-card loan-ledger-card"
                extra={
                    <Flex gap={8} wrap>
                        <Select
                            aria-label="Filter loans by status"
                            onChange={(status) => setFilter('status', status)}
                            options={statusOptions}
                            style={{ minWidth: 140 }}
                            value={filters.status ?? ''}
                        />

                        <TableSearchInput
                            ariaLabel="Search loans"
                            onChange={setSearch}
                            placeholder="Member, book or ISBN"
                            value={search}
                        />
                    </Flex>
                }
                styles={{ body: { padding: 0 } }}
                title={
                    <span>
                        Circulation ledger
                    </span>
                }
            >
                <LoanTable
                    canReturn={auth.can.returnLoans}
                    filters={filters}
                    loading={loading}
                    loans={loans.data}
                    meta={loans.meta}
                    onPageChange={handlePageChange}
                    onReturn={confirmReturn}
                    onTableChange={handleTableChange}
                />
            </Card>
        </StaffLayout>
    );
}
