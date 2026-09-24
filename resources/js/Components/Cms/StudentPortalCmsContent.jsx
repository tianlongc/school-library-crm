import InertiaButton from '@/Components/InertiaButton';
import BookOutlined from '@ant-design/icons/BookOutlined';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import NotificationOutlined from '@ant-design/icons/NotificationOutlined';
import ReadOutlined from '@ant-design/icons/ReadOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import { Card, Carousel, Col, Empty, Flex, Row, Tag, Typography } from 'antd';

const targetRoutes = {
    account: 'profile.edit',
    catalogue: 'member.books.index',
};

function CmsBlockBody({ body, bodyFormat, className }) {
    if (bodyFormat === 'html') {
        return (
            <div
                className="cms-portal-section-copy-rich"
                dangerouslySetInnerHTML={{ __html: body ?? '' }}
            />
        );
    }

    return (
        <Typography.Paragraph className={className}>
            {body}
        </Typography.Paragraph>
    );
}

function HeroBlock({ block }) {
    return (
        <section
            className="cms-portal-hero"
            style={
                block.data.media_url
                    ? { backgroundImage: `url("${block.data.media_url}")` }
                    : undefined
            }
        >
            <Typography.Text className="cms-portal-eyebrow">
                {block.data.eyebrow}
            </Typography.Text>
            <Typography.Title level={2} className="cms-portal-hero-title">
                {block.data.heading}
            </Typography.Title>
            <CmsBlockBody
                body={block.data.body}
                bodyFormat={block.data.body_format}
                className="cms-portal-hero-copy"
            />
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
                    <CmsBlockBody
                        body={block.data.body}
                        bodyFormat={block.data.body_format}
                        className="cms-portal-block-copy"
                    />
                </div>
            </Flex>
        </Card>
    );
}

function BookCarouselArrow({ direction, ...props }) {
    const className = props.className;
    const arrowProps = { ...props };
    const isPrevious = direction === 'previous';

    delete arrowProps.currentSlide;
    delete arrowProps.slideCount;

    return (
        <button
            {...arrowProps}
            aria-label={isPrevious ? 'Previous slide' : 'Next slide'}
            className={['cms-portal-carousel-arrow', className].filter(Boolean).join(' ')}
            type="button"
        >
            {isPrevious ? <LeftOutlined aria-hidden="true" /> : <RightOutlined aria-hidden="true" />}
        </button>
    );
}

function BookCollectionBlock({ block, booksById }) {
    const books = (block.data.book_ids ?? [])
        .map((bookId) => booksById[bookId])
        .filter(Boolean);
    const shouldUseCarousel = books.length > 3;

    const bookGrid = (
        <Row gutter={[16, 16]}>
            {books.map((book) => (
                <Col key={book.id} lg={8} sm={12} xs={24}>
                    <BookCard book={book} />
                </Col>
            ))}
        </Row>
    );

    const bookCarousel = (
        <div
            aria-label={block.data.heading}
            aria-roledescription="carousel"
            className="cms-portal-book-carousel"
            role="region"
        >
            <Carousel
                accessibility
                arrows
                autoplay={false}
                dotPlacement="bottom"
                infinite={false}
                nextArrow={<BookCarouselArrow direction="next" />}
                prevArrow={<BookCarouselArrow direction="previous" />}
                responsive={[
                    {
                        breakpoint: 960,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1,
                        },
                    },
                    {
                        breakpoint: 640,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        },
                    },
                ]}
                slidesToScroll={1}
                slidesToShow={3}
                swipeToSlide
            >
                {books.map((book, index) => (
                    <div
                        aria-label={`${index + 1} of ${books.length}: ${book.title}`}
                        aria-roledescription="slide"
                        className="cms-portal-book-slide"
                        key={book.id}
                        role="group"
                    >
                        <BookCard book={book} />
                    </div>
                ))}
            </Carousel>
        </div>
    );

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
            ) : shouldUseCarousel ? (
                bookCarousel
            ) : (
                bookGrid
            )}
        </section>
    );
}

function ImageBlock({ block }) {
    if (!block.data.media_url) {
        return null;
    }

    return (
        <figure className="cms-portal-image-block">
            <img
                alt={block.data.alt ?? ''}
                className="w-full rounded-lg object-cover"
                src={block.data.media_url}
            />
        </figure>
    );
}

function RichTextBlock({ block }) {
    return (
        <section className="cms-portal-rich-text">
            <Typography.Title level={2} className="cms-portal-section-title">
                {block.data.heading}
            </Typography.Title>
            <CmsBlockBody
                body={block.data.body}
                bodyFormat={block.data.body_format}
                className="cms-portal-section-copy"
            />
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

function BookCard({ book }) {
    return (
        <Card className="cms-portal-book" size="small">
            {book.cover_url ? (
                <img
                    alt={`Cover of ${book.title}`}
                    className="cms-portal-book-cover"
                    loading="lazy"
                    src={book.cover_url}
                />
            ) : (
                <div
                    aria-label={`No cover available for ${book.title}`}
                    className="cms-portal-book-cover-placeholder"
                    role="img"
                >
                    <BookOutlined aria-hidden="true" />
                    <span>No cover</span>
                </div>
            )}

            <span className="cms-portal-book-mark">
                <ReadOutlined aria-hidden="true" />
            </span>

            <Typography.Title
                className="cms-portal-book-title"
                level={4}
            >
                {book.title}
            </Typography.Title>

            <Typography.Text type="secondary">
                {book.author}
            </Typography.Text>
        </Card>
    );
}

const renderers = {
    announcement: AnnouncementBlock,
    book_collection: BookCollectionBlock,
    call_to_action: CallToActionBlock,
    hero: HeroBlock,
    image: ImageBlock,
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
