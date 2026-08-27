import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Head, router } from '@inertiajs/react';
import { App as AntdApp, Card, Flex, Input, Select, Typography } from 'antd';
import { useState } from 'react';
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
    const [search, setSearch] = useState(filters.search ?? '');
    const [loading, setLoading] = useState(false);
    const { message, modal } = AntdApp.useApp();

    const visitMembers = ({
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

        router.get(route('staff.members.index'), parameters, {
            preserveState: true,
            replace: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };

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
                        <Typography.Text
                            type="secondary"
                            className="directory-count"
                        >
                            {members.meta.total} total
                        </Typography.Text>
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
                            onChange={(status) =>
                                visitMembers({
                                    search,
                                    status,
                                })
                            }
                            style={{ minWidth: 150 }}
                        />

                        <Input.Search
                            allowClear
                            aria-label="Search members"
                            enterButton={<SearchOutlined />}
                            placeholder="Name, email or member number"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            onSearch={(value) =>
                                visitMembers({
                                    search: value,
                                    status: filters.status,
                                })
                            }
                        />
                    </Flex>
                }
                styles={{ body: { padding: 0 } }}
            >
                <MemberTable
                    can={can}
                    loading={loading}
                    members={members.data}
                    meta={members.meta}
                    search={filters.search}
                    onTransition={confirmTransition}
                    onPageChange={(page) =>
                        visitMembers({
                            search: filters.search,
                            status: filters.status,
                            page,
                        })
                    }
                />
            </Card>
        </StaffLayout>
    );
}