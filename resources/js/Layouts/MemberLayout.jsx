import AccountMenu from '@/Components/AccountMenu';
import ApplicationLogo from '@/Components/ApplicationLogo';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import { Link, router } from '@inertiajs/react';
import { Layout, Menu, Typography } from 'antd';

export default function MemberLayout({ children }) {
    const items = [
        { key: 'member.dashboard', label: 'Home', icon: <HomeOutlined /> },
        { key: 'profile.edit', label: 'Account', icon: <UserOutlined /> },
    ];
    const selectedKey = route().current('profile.*')
        ? 'profile.edit'
        : 'member.dashboard';

    return (
        <Layout className="member-layout">
            <a href="#main-content" className="ui-skip-link">
                Skip to main content
            </a>

            <Layout.Header className="member-header">
                <Link
                    href={route('member.dashboard')}
                    className="member-brand"
                    aria-label="Member library home"
                    prefetch
                >
                    <span className="member-brand-mark">
                        <ApplicationLogo className="h-5 w-5" />
                    </span>
                    <span className="member-brand-copy">
                        <Typography.Text strong className="member-brand-name">
                            School Library
                        </Typography.Text>
                        <Typography.Text className="member-brand-label">
                            Member desk
                        </Typography.Text>
                    </span>
                </Link>

                <Menu
                    className="member-navigation"
                    items={items}
                    mode="horizontal"
                    onClick={({ key }) => router.get(route(key))}
                    selectedKeys={[selectedKey]}
                />

                <div className="member-account">
                    <AccountMenu label="Member account" />
                </div>
            </Layout.Header>

            <Layout.Content
                id="main-content"
                tabIndex="-1"
                className="member-content"
            >
                {children}
            </Layout.Content>
        </Layout>
    );
}
