import InertiaButton from '@/Components/InertiaButton';
import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { PictureOutlined, EditOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Card, Col, Descriptions, Flex, Image, Row, Statistic, Typography } from 'antd';

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

function BookCover({ book }) {
    if (!book.cover_url) {
        return (
            <Flex
                className="book-cover-placeholder is-detail"
                align="center"
                justify="center"
                vertical
                gap={8}
            >
                <PictureOutlined />

                <Typography.Text type="secondary">
                    No cover available
                </Typography.Text>
            </Flex>
        );
    }

    return (
        <Image
            src={book.cover_url}
            alt={`Cover of ${book.title}`}
            width={180}
            height={270}
            className="book-detail-cover is-thumbnail"
            preview   
        />
    );
}

export default function Show({ book }) {
    const details = [
        { 
            key: 'title',
            label: 'Title',
            children: book.title
        },
        {
            key: 'author',
            label: 'Author',
            children: book.author
        },
        {
            key: 'isbn',
            label: 'ISBN',
            children: (
                <span className="table-meta-chip">
                        {book.isbn}
                </span>
            ),
        },
        {
            key: 'description',
            label: 'Description',
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
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={6}>
                                <Flex justify="center">
                                    <BookCover book={book} />
                                </Flex>
                            </Col>

                            <Col xs={24} md={18}>
                                <Descriptions
                                    bordered
                                    column={1}
                                    items={details}
                                    size="middle"
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} xl={7}>
                    <Card className="book-stat-card">
                        <Row gutter={[12, 12]}>
                            <Col xs={24} sm={12}>
                                <Statistic
                                    title="Available copies"
                                    value={book.available_copies}
                                />
                            </Col>

                            <Col xs={24} sm={12}>
                                <Statistic
                                    title="Total copies"
                                    value={book.total_copies}
                                />
                            </Col>
                        </Row>

                        <Typography.Text type="secondary">
                            Current availability and physical copies recorded for this title.
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
