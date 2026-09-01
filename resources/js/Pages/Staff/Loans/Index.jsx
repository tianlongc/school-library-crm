import InertiaButton from '@/Components/InertiaButton';
import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Head, router, usePage } from '@inertiajs/react';
import { App as AntdApp, Card, Flex, Input, Select, Typography } from 'antd';
import { useState } from 'react';
import LoanTable from './Components/LoanTable';

const statusOptions = [
    { value: '', label: 'All loans' },
    { value: 'active', label: 'Active' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'returned', label: 'Returned' },
];

export default function Index({ filters, loans }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [loading, setLoading] = useState(false);
    const { message, modal } = AntdApp.useApp();

    const visitLoans = ({
        search: nextSearch = filters.search ?? '',
        status: nextStatus = filters.status ?? '',
        page,
    } = {}) => {
        const parameters = {};

        if (nextSearch.trim()) {
            parameters.search = nextSearch.trim();
        }

        if (nextStatus) {
            parameters.status = nextStatus;
        }

        if (page) {
            parameters.page = page;
        }

        router.get(route('staff.loans.index'), parameters, {
            onFinish: () => setLoading(false),
            onStart: () => setLoading(true),
            preserveState: true,
            replace: true,
        });
    };

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
                            onChange={(status) =>
                                visitLoans({ search, status })
                            }
                            options={statusOptions}
                            style={{ minWidth: 140 }}
                            value={filters.status ?? ''}
                        />

                        <Input.Search
                            allowClear
                            aria-label="Search loans"
                            enterButton={<SearchOutlined />}
                            onChange={(event) => setSearch(event.target.value)}
                            onSearch={(value) =>
                                visitLoans({
                                    search: value,
                                    status: filters.status,
                                })
                            }
                            placeholder="Member, book or ISBN"
                            value={search}
                        />
                    </Flex>
                }
                styles={{ body: { padding: 0 } }}
                title={
                    <span>
                        Circulation ledger
                        <Typography.Text
                            className="directory-count"
                            type="secondary"
                        >
                            {loans.meta.total} total
                        </Typography.Text>
                    </span>
                }
            >
                <LoanTable
                    canReturn={auth.can.returnLoans}
                    loading={loading}
                    loans={loans.data}
                    meta={loans.meta}
                    onPageChange={(page) =>
                        visitLoans({
                            page,
                            search: filters.search,
                            status: filters.status,
                        })
                    }
                    onReturn={confirmReturn}
                    search={filters.search}
                    status={filters.status}
                />
            </Card>
        </StaffLayout>
    );
}
