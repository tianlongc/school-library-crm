import DownOutlined from '@ant-design/icons/DownOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import { router, usePage } from '@inertiajs/react';
import { Avatar, Button, Dropdown, Flex, Typography } from 'antd';

function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

export default function AccountMenu({ label = 'Library account' }) {
    const { auth } = usePage().props;
    const items = [
        {
            key: 'settings',
            icon: <SettingOutlined aria-hidden="true" />,
            label: 'Account settings',
        },
        { type: 'divider' },
        {
            key: 'logout',
            danger: true,
            icon: <LogoutOutlined aria-hidden="true" />,
            label: 'Log out',
        },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            router.post(route('logout'));
            return;
        }

        router.get(route('profile.edit'));
    };

    return (
        <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight" trigger={['click']}>
            <Button type="text" className="account-menu-trigger" aria-label="Open account menu">
                <Flex align="center" gap={8}>
                    <Avatar shape="square" size={36} className="account-avatar">
                        {initials(auth.user.name)}
                    </Avatar>
                    <span className="account-menu-copy">
                        <Typography.Text strong ellipsis className="account-menu-name">
                            {auth.user.name}
                        </Typography.Text>
                        <Typography.Text type="secondary" className="account-menu-label">
                            {label}
                        </Typography.Text>
                    </span>
                    <DownOutlined className="account-menu-chevron" aria-hidden="true" />
                </Flex>
            </Button>
        </Dropdown>
    );
}
