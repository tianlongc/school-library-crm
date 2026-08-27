import AccountMenu from '@/Components/AccountMenu';
import MenuOutlined from '@ant-design/icons/MenuOutlined';
import { Button, Layout, Typography } from 'antd';

export default function WorkspaceHeader({ accountLabel, eyebrow, onMenuClick, title }) {
    return (
        <Layout.Header className="workspace-header">
            <div className="workspace-header-inner">
                <Button
                    type="text"
                    icon={<MenuOutlined aria-hidden="true" />}
                    onClick={onMenuClick}
                    className="workspace-menu-button"
                    aria-label="Open navigation"
                />

                <div className="workspace-heading">
                    <Typography.Text className="workspace-context">
                        {eyebrow}
                    </Typography.Text>
                    <span className="workspace-heading-divider" aria-hidden="true">/</span>
                    <Typography.Text strong ellipsis className="workspace-title">{title}</Typography.Text>
                </div>

                <div className="workspace-account">
                    <AccountMenu label={accountLabel} />
                </div>
            </div>
        </Layout.Header>
    );
}
