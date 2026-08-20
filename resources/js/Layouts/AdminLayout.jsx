import AdminSidebar from '@/Components/Admin/AdminSidebar';
import WorkspaceLayout from '@/Layouts/WorkspaceLayout';

export default function AdminLayout({ children, title }) {
    return (
        <WorkspaceLayout
            accountLabel="Administrator"
            eyebrow="Admin workspace"
            Sidebar={AdminSidebar}
            title={title}
        >
            {children}
        </WorkspaceLayout>
    );
}
