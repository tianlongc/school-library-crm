import InertiaButton from '@/Components/InertiaButton';
import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import EditOutlined from '@ant-design/icons/EditOutlined';
import { Head } from '@inertiajs/react';
import { Card, Col, Descriptions, Row, Statistic, Typography } from 'antd';

function formatDate(value) {
    if (!value) {
        return 'Not available';
    }

    return new Intl.DateTimeFormat('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function Show({ book }) {
    const details = [
        { key: 'title', label: 'Title', children: book.title },
        { key: 'author', label: 'Author', children: book.author },
        {
            key: 'isbn',
            label: 'ISBN',
            children: <Typography.Text code>{book.isbn}</Typography.Text>,
        },
        {
            key: 'description',
            label: 'Description',
            span: 'filled',
            children: (
                <Typography.Paragraph className="book-description">
                    {book.description || 'No description has been added for this book.'}
                </Typography.Paragraph>
            ),
        },
    ];
    const history = [
        {
            key: 'created',
            label: 'Created',
            children: formatDate(book.created_at),
        },
        {
            key: 'updated',
            label: 'Last updated',
            children: formatDate(book.updated_at),
        },
    ];

    return (
        <StaffLayout title={book.title}>
            <Head title={book.title} />
            <PageHeader
                title={book.title}
                description={`Catalogue record by ${book.author}`}
                breadcrumbs={[
                    { label: 'Books', href: route('staff.books.index') },
                    { label: book.title },
                ]}
                actions={
                    <>
                        <InertiaButton href={route('staff.books.index')}>
                            Back to books
                        </InertiaButton>
                        <InertiaButton
                            href={route('staff.books.edit', book.id)}
                            type="primary"
                            icon={<EditOutlined />}
                        >
                            Edit book
                        </InertiaButton>
                    </>
                }
            />

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={17}>
                    <Card title="Book details">
                        <Descriptions
                            bordered
                            column={{ xs: 1, sm: 2 }}
                            items={details}
                            size="middle"
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={7}>
                    <Card className="book-stat-card">
                        <Statistic title="Total copies" value={book.total_copies} />
                        <Typography.Text type="secondary">
                            Physical copies recorded for this title.
                        </Typography.Text>
                    </Card>
                    <Card title="Record history" className="record-history-card">
                        <Descriptions column={1} items={history} size="small" />
                    </Card>
                </Col>
            </Row>
        </StaffLayout>
    );
}
