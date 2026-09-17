import InertiaButton from '@/Components/InertiaButton';
import BookOutlined from '@ant-design/icons/BookOutlined';
import NotificationOutlined from '@ant-design/icons/NotificationOutlined';
import ReadOutlined from '@ant-design/icons/ReadOutlined';
import { Card, Col, Empty, Flex, Row, Tag, Typography } from 'antd';

const targetRoutes = {
    account: 'profile.edit',
    catalogue: 'member.books.index',
};

function HeroBlock({ block }) {
    return (
        <section className="cms-portal-hero">
            <Typography.Text className="cms-portal-eyebrow">
                {block.data.eyebrow}
            </Typography.Text>
            <Typography.Title level={2} className="cms-portal-hero-title">
                {block.data.heading}
            </Typography.Title>
            <Typography.Paragraph className="cms-portal-hero-copy">
                {block.data.body}
            </Typography.Paragraph>
        </section>
    );
}

function AnnouncementBlock({ block }) {
    return (
        <Card className="cms-portal-card cms-portal-announcement">
            <Flex align="flex-start" gap={14}>
                <span className="cms-portal-icon">
                    <NotificationOutlined aria-hidden="true" />
                </span>
                <div>
                    <Typography.Title level={3} className="cms-portal-block-title">
                        {block.data.heading}
                    </Typography.Title>
                    <Typography.Paragraph className="cms-portal-block-copy">
                        {block.data.body}
                    </Typography.Paragraph>
                </div>
            </Flex>
        </Card>
    );
}

function BookCollectionBlock({ block, booksById }) {
    const books = (block.data.book_ids ?? [])
        .map((bookId) => booksById[bookId])
        .filter(Boolean);

    return (
        <section className="cms-portal-section">
            <Flex align="end" justify="space-between" gap={16} wrap>
                <div>
                    <Typography.Title level={2} className="cms-portal-section-title">
                        {block.data.heading}
                    </Typography.Title>
                    <Typography.Paragraph className="cms-portal-section-copy">
                        {block.data.body}
                    </Typography.Paragraph>
                </div>
                <Tag icon={<BookOutlined />}>{books.length} selected</Tag>
            </Flex>
            {books.length === 0 ? (
                <Empty
                    className="cms-portal-empty"
                    description="No books have been selected yet."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <Row gutter={[16, 16]}>
                    {books.map((book) => (
                        <Col key={book.id} xs={24} sm={12} lg={8}>
                            <Card className="cms-portal-book" size="small">
                                <span className="cms-portal-book-mark">
                                    <ReadOutlined aria-hidden="true" />
                                </span>
                                <Typography.Title level={4} className="cms-portal-book-title">
                                    {book.title}
                                </Typography.Title>
                                <Typography.Text type="secondary">
                                    {book.author}
                                </Typography.Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </section>
    );
}

function RichTextBlock({ block }) {
    return (
        <section className="cms-portal-rich-text">
            <Typography.Title level={2} className="cms-portal-section-title">
                {block.data.heading}
            </Typography.Title>
            <Typography.Paragraph className="cms-portal-section-copy">
                {block.data.body}
            </Typography.Paragraph>
        </section>
    );
}

function CallToActionBlock({ block }) {
    const routeName = targetRoutes[block.data.target] ?? targetRoutes.catalogue;

    return (
        <section className="cms-portal-cta">
            <div>
                <Typography.Title level={2} className="cms-portal-cta-title">
                    {block.data.heading}
                </Typography.Title>
                <Typography.Paragraph className="cms-portal-cta-copy">
                    {block.data.body}
                </Typography.Paragraph>
            </div>
            <InertiaButton href={route(routeName)} size="large" type="primary">
                {block.data.label}
            </InertiaButton>
        </section>
    );
}

const renderers = {
    announcement: AnnouncementBlock,
    book_collection: BookCollectionBlock,
    call_to_action: CallToActionBlock,
    hero: HeroBlock,
    rich_text: RichTextBlock,
};

export default function StudentPortalCmsContent({ books = [], content }) {
    const booksById = Object.fromEntries(books.map((book) => [book.id, book]));
    const blocks = Array.isArray(content?.blocks) ? content.blocks : [];

    return blocks.map((block) => {
        const Block = renderers[block.type];

        if (!Block || block.is_visible === false) {
            return null;
        }

        return <Block key={block.id} block={block} booksById={booksById} />;
    });
}
