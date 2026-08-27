import { Link } from '@inertiajs/react';
import { Breadcrumb, Flex, Typography, theme } from 'antd';

export default function PageHeader({ title, description, eyebrow, breadcrumbs = [], actions }) {
    const { token } = theme.useToken();
    const breadcrumbItems = breadcrumbs.map((item) => ({
        title: item.href ? <Link href={item.href}>{item.label}</Link> : item.label,
    }));

    return (
        <div className="app-page-header" style={{ borderColor: token.colorBorderSecondary }}>
            <div className="min-w-0">
                {breadcrumbs.length > 0 && (
                    <Breadcrumb className="app-breadcrumb" items={breadcrumbItems} />
                )}
                {eyebrow && <Typography.Text className="app-page-eyebrow">{eyebrow}</Typography.Text>}
                <Flex align="flex-start" gap={12}>
                    <span className="library-rule mt-1" aria-hidden="true" />
                    <div className="min-w-0">
                        <Typography.Title level={1} className="app-page-title">
                            {title}
                        </Typography.Title>
                        {description && (
                            <Typography.Paragraph type="secondary" className="app-page-description">
                                {description}
                            </Typography.Paragraph>
                        )}
                    </div>
                </Flex>
            </div>
            {actions && <Flex className="app-page-actions" wrap gap={8}>{actions}</Flex>}
        </div>
    );
}
