import PageHeader from "@/Components/PageHeader";
import TableSearchInput from "@/Components/Tables/TableSearchInput";
import { useServerTable } from "@/Components/Tables/useServerTable";
import StaffLayout from "@/Layouts/StaffLayout";
import { getRequestErrorMessage } from "@/Utils/requestErrorMessage";
import { DownloadOutlined } from "@ant-design/icons";
import { Head, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import {
    App as AntdApp,
    Button,
    Card,
    DatePicker,
} from 'antd';
import { useEffect } from "react";
import OverdueLoanTable from "./Components/OverdueLoanTable";

export default function Overdue({
    filters: initialFilters,
    loans: initialLoans
}) {
    const { auth } = usePage().props;
    const { message } = AntdApp.useApp();

    const {
        error,
        filters,
        handlePageChange,
        handleTableChange,
        loading,
        refresh,
        resource: loans,
        search,
        setSearch
    } = useServerTable({
        initialFilters,
        initialResource: initialLoans,
        queryRouteName: 'staff.reports.overdue.query',
    });

    useEffect(() => {
        if (error) {
            message.error(
                getRequestErrorMessage(
                    error,
                    'The overdue report could not be refreshed.',
                ),
            );
        }
    }, [error, message]);

    const dateRange =
        filters.from && filters.to
            ? [dayjs(filters.from), dayjs(filters.to)]
            : null;

    const updateDateRange = (dates) => {
        void refresh({
            page: 1,
            search: search.trim(),
            from: dates?.[0]?.format('YYYY-MM-DD') ?? '',
            to: dates?.[1]?.format('YYYY-MM-DD') ?? '',
        });
    };

    const exportReport = () => {
        window.location.assign(
            route('staff.reports.overdue.export', {
                search: filters.search ?? '',
                from: filters.from ?? '',
                to: filters.to ?? '',
            }),
        );
    };

    return (
        <StaffLayout title="Overdue report">
            <Head title="Overdue report" />

            <PageHeader
                actions={
                    auth.can.exportReports ? (
                        <Button
                            icon={<DownloadOutlined />}
                            type="primary"
                            onClick={exportReport}
                        >
                            Export Excel
                        </Button>
                    ) : undefined
                }
                description="Review books that are past their due date and export the filtered results."
                eyebrow="Reporting"
                title="Overdue loans"
            />

            <Card
                className="directory-card"
                title={
                    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <span>Overdue loan ledger</span>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="w-full sm:w-[240px]">
                                <DatePicker.RangePicker
                                    aria-label="Filter overdue loans by due date"
                                    format="YYYY-MM-DD"
                                    value={dateRange}
                                    onChange={updateDateRange}
                                    className="w-full"
                                />
                            </div>

                            <div className="w-full sm:w-[340px]">
                                <TableSearchInput
                                    ariaLabel="Search overdue loans"
                                    placeholder="Member, book or ISBN"
                                    value={search}
                                    onChange={setSearch}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                }
                styles={{
                    header: {
                        paddingTop: 16,
                        paddingBottom: 16,
                    },
                    body: {
                        padding: 0,
                    },
                }}
            >
                <OverdueLoanTable
                    filters={filters}
                    loading={loading}
                    loans={loans.data}
                    meta={loans.meta}
                    onPageChange={handlePageChange}
                    onTableChange={handleTableChange}
                />
            </Card>
        </StaffLayout>
    );
}