import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    LayoutOutlined,
    BookOutlined,
    DashboardOutlined,
    LogoutOutlined,
    ReadOutlined,
    SettingOutlined,
    TagsOutlined,
    TeamOutlined,
    UserSwitchOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { Link, router, usePage } from '@inertiajs/react';
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
    active: 'admin.dashboard',
};

const memberNavigation = {
    key: 'staff.members.index',
    label: 'Members',
    icon: <TeamOutlined />,
    active: 'staff.members.*',
};

const cmsNavigation = {
    key: 'admin.cms.index',
    label: 'Homepage CMS',
    icon: <LayoutOutlined />,
    active: 'admin.cms.*',
};

const reportsNavigation = {
    key: 'staff.reports.overdue',
    label: 'Reports',
    icon: <BarChartOutlined />,
    active: 'staff.reports.*',
};

export default function StaffSidebar({ onNavigate }) {
    const { auth } = usePage().props;
    const navigation = [
        ...primaryNavigation,
        ...(auth.can.viewLoans ? [loanNavigation] : []),
        ...(auth.can.viewMembers ? [memberNavigation] : []),
        ...(auth.can.viewAdminDashboard ? [adminNavigation] : []),
        ...(auth.can.viewCms ? [cmsNavigation] : []),
        ...(auth.can.viewReports ? [reportsNavigation] : []),
    ];
    const selectedNavigation = navigation.find((item) =>
        route().current(item.active),
    );
    const selectedUtility = route().current('profile.*')
        ? ['profile.edit']
        : [];

    const navigationItems = navigation.map((item) => ({
        ...item,
        label: <Link href={route(item.key)} onClick={onNavigate}>{item.label}</Link>,
    }));

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
                items={navigationItems}
                mode="inline"
                selectedKeys={selectedNavigation ? [selectedNavigation.key] : []}
                theme="dark"
            />

            <Menu
                className="staff-utility-navigation"
                items={[
                    {
                        key: 'profile.edit',
                        label: <Link href={route('profile.edit')} onClick={onNavigate}>Settings</Link>,
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
                onClick={({ key }) => {
                    if (key === 'logout') {
                        onNavigate?.();
                        router.post(route('logout'));
                    }
                }}
                selectedKeys={selectedUtility}
                theme="dark"
            />
        </div>
    );
}
