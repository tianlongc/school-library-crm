import InertiaButton from '@/Components/InertiaButton';
import PageHeader from '@/Components/PageHeader';
import TableSearchInput from '@/Components/Tables/TableSearchInput';
import { useServerTable } from '@/Components/Tables/useServerTable';
import StaffLayout from '@/Layouts/StaffLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import { Head, usePage } from '@inertiajs/react';
import { App as AntdApp, Card, Flex, Select } from 'antd';
import { useEffect } from 'react';
import LoanTable from './Components/LoanTable';

const statusOptions = [
    { value: '', label: 'All loans' },
    { value: 'active', label: 'Active' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'return_requested', label: 'Return requested' },
    { value: 'returned', label: 'Returned' },
];

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
});

const formatDate = (value) =>
    value ? dateFormatter.format(new Date(value)) : '—';

export default function Index({ filters: initialFilters, loans: initialLoans }) {
    const { auth } = usePage().props;
    const { message, modal } = AntdApp.useApp();
    const {
        error,
        filters,
        handlePageChange,
        handleTableChange,
        loading,
        refresh,
        resource: loans,
        search,
        setFilter,
        setSearch,
    } = useServerTable({
        initialFilters,
        initialResource: initialLoans,
        queryRouteName: 'staff.loans.query',
    });

    useEffect(() => {
        const interval = window.setInterval(() => {
            if (!loading && document.visibilityState === 'visible') {
                void refresh();
            }
        }, 10000);

        return () => window.clearInterval(interval);
    }, [loading, refresh]);

    useEffect(() => {
        if (error) {
            message.error(
                getRequestErrorMessage(
                    error,
                    'The loan table could not be refreshed. Try again.',
                ),
            );
        }
    }, [error, message]);

    const confirmRenew = (loan) => {
        modal.confirm({
            title: 'Renew this loan?',
            content: `${loan.book.title} for ${loan.member.name} is currently due ${formatDate(
                loan.due_at,
            )}. Renewal adds 14 days to the current due date and can only be used once.`,
            okText: 'Renew for 14 days',
            cancelText: 'Keep current due date',
            async onOk() {
                try {
                    const payload = await jsonRequest({
                        url: route('staff.loans.renew', loan.id),
                        method: 'POST',
                    });

                    message.success(payload.message);
                    await refresh();
                } catch (error) {
                    message.error(
                        getRequestErrorMessage(
                            error,
                            'The loan could not be renewed. Try again.',
                        ),
                    );

                    throw error;
                }
            },
        });
    };

    const confirmReturn = (loan) => {
        const isReturnRequested = loan.status === 'return_requested';

        modal.confirm({
            title: isReturnRequested
                ? 'Confirm book received?'
                : 'Record this book as returned?',
            content: isReturnRequested
                ? `Confirm staff has physically received ${loan.book.title} from ${loan.member.name}.`
                : `${loan.book.title} will be checked in from ${loan.member.name}.`,
            okText: isReturnRequested ? 'Confirm received' : 'Record return',
            cancelText: 'Cancel',
            async onOk() {
                try {
                    const payload = await jsonRequest({
                        url: route('staff.loans.return', loan.id),
                        method: 'POST',
                    });

                    message.success(payload.message);
                    await refresh();
                } catch (error) {
                    message.error(
                        getRequestErrorMessage(
                            error,
                            'The return could not be confirmed. Try again.',
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
                description="Issue books, watch due dates, and confirm received returns from one circulation ledger."
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
                    canRenew={auth.can.renewLoans}
                    canReturn={auth.can.returnLoans}
                    filters={filters}
                    loading={loading}
                    loans={loans.data}
                    meta={loans.meta}
                    onPageChange={handlePageChange}
                    onRenew={confirmRenew}
                    onReturn={confirmReturn}
                    onTableChange={handleTableChange}
                />
            </Card>
        </StaffLayout>
    );
}
