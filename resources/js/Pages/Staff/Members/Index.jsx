import PageHeader from '@/Components/PageHeader';
import TableSearchInput from '@/Components/Tables/TableSearchInput';
import { useServerTable } from '@/Components/Tables/useServerTable';
import StaffLayout from '@/Layouts/StaffLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { Head, router } from '@inertiajs/react';
import { App as AntdApp, Card, Flex, Select } from 'antd';
import MemberTable from './Components/MemberTable';

const transitionDetails = {
    suspend: {
        title: 'Suspend member?',
        confirmation: 'Suspend member',
        fallback: 'The member could not be suspended.',
    },
    deactivate: {
        title: 'Deactivate member?',
        confirmation: 'Deactivate member',
        fallback: 'The member could not be deactivated.',
    },
    reactivate: {
        title: 'Reactivate member?',
        confirmation: 'Reactivate member',
        fallback: 'The member could not be reactivated.',
    },
};

export default function Index({ members, filters, statuses, can }) {
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
        resource: 'members',
        routeName: 'staff.members.index',
    });

    const confirmTransition = (member, transition) => {
        const details = transitionDetails[transition];

        modal.confirm({
            title: details.title,
            content: `${details.confirmation} for ${member.name}?`,
            okText: details.confirmation,
            cancelText: 'Cancel',
            okButtonProps: {
                danger: transition !== 'reactivate',
            },
            async onOk() {
                try {
                    const response = await jsonRequest({
                        url: route(
                            `staff.members.${transition}`,
                            member.id,
                        ),
                        method: 'POST',
                    });

                    message.success(response.message);
                    router.reload({ only: ['members'] });
                } catch (error) {
                    message.error(
                        getRequestErrorMessage(
                            error,
                            `${details.fallback} Try again.`,
                        ),
                    );

                    throw error;
                }
            },
        });
    };

    return (
        <StaffLayout title="Members">
            <Head title="Members" />

            <PageHeader
                eyebrow="Membership"
                title="Members"
                description="Review member accounts and manage borrowing eligibility."
            />

            <Card
                className="directory-card"
                title={
                    <span>
                        Member directory
                    </span>
                }
                extra={
                    <Flex gap={8} wrap>
                        <Select
                            aria-label="Filter members by status"
                            options={[
                                {
                                    value: '',
                                    label: 'All statuses',
                                },
                                ...statuses,
                            ]}
                            value={filters.status ?? ''}
                            onChange={(status) => setFilter('status', status)}
                            style={{ minWidth: 150 }}
                        />

                        <TableSearchInput
                            ariaLabel="Search members"
                            placeholder="Name, email or member number"
                            value={search}
                            onChange={setSearch}
                        />
                    </Flex>
                }
                styles={{ body: { padding: 0 } }}
            >
                <MemberTable
                    can={can}
                    filters={filters}
                    loading={loading}
                    members={members.data}
                    meta={members.meta}
                    onTransition={confirmTransition}
                    onPageChange={handlePageChange}
                    onTableChange={handleTableChange}
                />
            </Card>
        </StaffLayout>
    );
}
