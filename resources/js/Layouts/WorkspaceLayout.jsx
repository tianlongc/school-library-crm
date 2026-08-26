import WorkspaceHeader from '@/Components/WorkspaceHeader';
import { Drawer, Layout } from 'antd';
import { useState } from 'react';

export default function WorkspaceLayout({
    accountLabel,
    children,
    eyebrow,
    Sidebar,
    title,
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <Layout className="workspace-layout">
            <a href="#main-content" className="ui-skip-link">
                Skip to main content
            </a>

            <Layout.Sider className="workspace-sider" width={272} theme="dark">
                <Sidebar />
            </Layout.Sider>

            <Drawer
                className="workspace-drawer"
                closable={false}
                destroyOnHidden
                mask={{ blur: true, closable: true }}
                onClose={() => setSidebarOpen(false)}
                open={sidebarOpen}
                placement="left"
                size="min(18rem, 88vw)"
                styles={{ body: { padding: 0 } }}
            >
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </Drawer>

            <Layout className="workspace-main-layout">
                <WorkspaceHeader
                    accountLabel={accountLabel}
                    eyebrow={eyebrow}
                    title={title}
                    onMenuClick={() => setSidebarOpen(true)}
                />
                <Layout.Content id="main-content" tabIndex="-1" className="workspace-content">
                    {children}
                </Layout.Content>
            </Layout>
        </Layout>
    );
}
