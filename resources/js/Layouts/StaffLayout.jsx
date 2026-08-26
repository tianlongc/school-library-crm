import StaffSidebar from '@/Components/Staff/StaffSidebar';
import WorkspaceLayout from '@/Layouts/WorkspaceLayout';

export default function StaffLayout({ children, title }) {
    return (
        <WorkspaceLayout
            accountLabel="Library account"
            eyebrow="Library workspace"
            Sidebar={StaffSidebar}
            title={title}
        >
            {children}
        </WorkspaceLayout>
    );
}
