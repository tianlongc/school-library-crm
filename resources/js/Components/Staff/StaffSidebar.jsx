import ApplicationLogo from '@/Components/ApplicationLogo';
import BookOutlined from '@ant-design/icons/BookOutlined';
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import ReadOutlined from '@ant-design/icons/ReadOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import TagsOutlined from '@ant-design/icons/TagsOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import UserSwitchOutlined from '@ant-design/icons/UserSwitchOutlined';
import { router, usePage } from '@inertiajs/react';
import { Menu, Typography } from 'antd';

const primaryNavigation = [
    {
        key: 'staff.dashboard',
        label: 'Dashboard',
        icon: <DashboardOutlined />,
        active: 'staff.dashboard',
    },
    {
        key: 'staff.books.index',
        label: 'Books',
        icon: <BookOutlined />,
        active: 'staff.books.*',
    },
    {
        key: 'staff.categories.index',
        label: 'Categories',
        icon: <TagsOutlined />,
        active: 'staff.categories.*',
    },
];

const loanNavigation = {
    key: 'staff.loans.index',
    label: 'Loans',
    icon: <ReadOutlined />,
    active: 'staff.loans.*',
};

const adminNavigation = {
    key: 'admin.dashboard',
    label: 'User management',
    icon: <UserSwitchOutlined />,
    active: 'admin.*',
};

const memberNavigation = {
    key: 'staff.members.index',
    label: 'Members',
    icon: <TeamOutlined />,
    active: 'staff.members.*',
};

export default function StaffSidebar({ onNavigate }) {
    const { auth } = usePage().props;
    const navigation = [
        ...primaryNavigation,
        ...(auth.can.viewLoans ? [loanNavigation] : []),
        ...(auth.can.viewMembers ? [memberNavigation] : []),
        ...(auth.can.viewAdminDashboard ? [adminNavigation] : []),
    ];
    const selectedNavigation = navigation.find((item) =>
        route().current(item.active),
    );
    const selectedUtility = route().current('profile.*')
        ? ['profile.edit']
        : [];

    const navigate = ({ key }) => {
        onNavigate?.();

        if (key === 'logout') {
            router.post(route('logout'));
            return;
        }

        router.get(route(key));
    };

    return (
        <div className="staff-sidebar">
            <div className="staff-sidebar-brand">
                <span className="library-mark">
                    <ApplicationLogo className="h-5 w-5" />
                </span>
                <span>
                    <Typography.Text strong className="staff-sidebar-name">
                        School Library
                    </Typography.Text>
                    <Typography.Text className="staff-sidebar-workspace">
                        Library workspace
                    </Typography.Text>
                </span>
            </div>

            <Menu
                className="staff-navigation"
                items={navigation}
                mode="inline"
                onClick={navigate}
                selectedKeys={selectedNavigation ? [selectedNavigation.key] : []}
                theme="dark"
            />

            <Menu
                className="staff-utility-navigation"
                items={[
                    {
                        key: 'profile.edit',
                        label: 'Settings',
                        icon: <SettingOutlined />,
                    },
                    {
                        key: 'logout',
                        label: 'Log out',
                        icon: <LogoutOutlined />,
                        danger: true,
                    },
                ]}
                mode="inline"
                onClick={navigate}
                selectedKeys={selectedUtility}
                theme="dark"
            />
        </div>
    );
}
