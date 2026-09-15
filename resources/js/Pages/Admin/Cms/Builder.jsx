import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { normalizeCmsDocument } from '@/Utils/cmsPageDocument';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { useCmsContentAutosave } from '@/Utils/useCmsContentAutosave';
import { CheckCircleFilled, CloudSyncOutlined, EyeOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { App as AntdApp, Button, Flex, Tag } from 'antd';
import { useState } from 'react';

import CmsPageBuilder from './Components/CmsPageBuilder';

const autosaveLabels = {
    error: { color: 'error', label: 'Autosave failed' },
    idle: { color: 'default', label: 'All changes saved' },
    pending: { color: 'processing', label: 'Unsaved changes' },
    saved: { color: 'success', label: 'Draft saved' },
    saving: { color: 'processing', label: 'Saving draft…' },
};

export default function Builder({ bookOptions = [], page }) {
    const { message } = AntdApp.useApp();
    const [content, setContent] = useState(() => normalizeCmsDocument(page.draft_content));
    const [publishing, setPublishing] = useState(false);
    const { saveNow, status } = useCmsContentAutosave({ content });
    const autosave = autosaveLabels[status];

    const publish = async () => {
        setPublishing(true);

        try {
            await saveNow();
            const payload = await jsonRequest({
                url: route('admin.cms.publish'),
                method: 'POST',
            });
            message.success(payload.message);
        } catch (error) {
            message.error(getRequestErrorMessage(error, 'The student portal could not be published.'));
        } finally {
            setPublishing(false);
        }
    };

    return (
        <StaffLayout title="Student portal builder">
            <Head title="Student portal builder" />
            <PageHeader
                eyebrow="Content management"
                title="Student portal builder"
                description="Design the editable homepage area while member tools and loan actions stay protected."
                actions={
                    <Flex align="center" gap={8} wrap>
                        <Tag className="cms-builder-save-status" color={autosave.color} icon={status === 'saved' ? <CheckCircleFilled /> : <CloudSyncOutlined />}>
                            {autosave.label}
                        </Tag>
                        <Button href={route('admin.cms.preview')} icon={<EyeOutlined />} target="_blank">
                            Preview draft
                        </Button>
                        <Button loading={publishing} onClick={publish} type="primary">
                            Publish
                        </Button>
                    </Flex>
                }
            />
            <CmsPageBuilder bookOptions={bookOptions} content={content} onChange={setContent} />
        </StaffLayout>
    );
}
