import PageHeader from '@/Components/PageHeader';
import StaffLayout from '@/Layouts/StaffLayout';
import { normalizeCmsDocument } from '@/Utils/cmsPageDocument';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { useCmsContentAutosave } from '@/Utils/useCmsContentAutosave';
import { CheckCircleFilled, CloudSyncOutlined, EyeOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { App as AntdApp, Button, Flex, Typography } from 'antd';
import { useState } from 'react';
import CmsPageBuilder from './Components/CmsPageBuilder';

const autosaveLabels = {
    error: { label: 'Autosave failed' },
    idle: { label: 'All changes saved' },
    pending: { label: 'Unsaved changes' },
    saved: { label: 'Draft saved' },
    saving: { label: 'Saving draft…' },
};

export default function Builder({ bookOptions = [], page }) {
    const { message, modal } = AntdApp.useApp();
    const [content, setContent] = useState(() => normalizeCmsDocument(page.draft_content));
    const [publishedContent, setPublishedContent] = useState(() => normalizeCmsDocument(page.published_content));
    const [publishedAt, setPublishedAt] = useState(page.published_at);
    const [publishing, setPublishing] = useState(false);
    const { saveNow, status } = useCmsContentAutosave({ content });
    const autosave = autosaveLabels[status];
    const hasUnpublishedChanges =
        !publishedAt || JSON.stringify(content) !== JSON.stringify(publishedContent);
    const publishedLabel = publishedAt
        ? `Last published ${new Intl.DateTimeFormat('en-MY', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(publishedAt))}`
        : 'Not published yet';

    const publish = () => {
        const visibleBlockCount = content.blocks.filter((block) => block.is_visible !== false).length;

        modal.confirm({
            title: 'Publish student portal changes?',
            content: (
                <div>
                    <p>{visibleBlockCount} visible {visibleBlockCount === 1 ? 'block' : 'blocks'} will appear on the student portal.</p>
                    <p>{publishedLabel}</p>
                    <a href={route('admin.cms.preview')} rel="noopener noreferrer" target="_blank">Review draft in a new tab</a>
                </div>
            ),
            okText: 'Publish changes',
            cancelText: 'Keep editing',
            async onOk() {
                setPublishing(true);

                try {
                    await saveNow();
                    const payload = await jsonRequest({
                        url: route('admin.cms.publish'),
                        method: 'POST',
                    });
                    setPublishedContent(normalizeCmsDocument(payload.page.published_content));
                    setPublishedAt(payload.page.published_at);
                    message.success(payload.message);
                } catch (error) {
                    message.error(getRequestErrorMessage(error, 'The student portal could not be published.'));
                    throw error;
                } finally {
                    setPublishing(false);
                }
            },
        });
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
                        <span aria-live="polite" className={`cms-builder-save-status is-${status}`} role="status">
                            {status === 'saved' ? <CheckCircleFilled /> : <CloudSyncOutlined />}
                            {autosave.label}
                        </span>
                        {status === 'error' && (
                            <Button
                                onClick={() => void saveNow().catch((error) => {
                                    message.error(getRequestErrorMessage(error, 'The draft could not be saved. Try again.'));
                                })}
                                size="small"
                            >
                                Retry save
                            </Button>
                        )}
                        <Typography.Text aria-live="polite" type={hasUnpublishedChanges ? 'warning' : 'secondary'}>
                            {hasUnpublishedChanges ? `Unpublished changes · ${publishedLabel}` : publishedLabel}
                        </Typography.Text>
                        <Button href={route('admin.cms.preview')} icon={<EyeOutlined />} target="_blank">
                            Preview draft
                        </Button>
                        <Button disabled={!hasUnpublishedChanges} loading={publishing} onClick={publish} type="primary">
                            Publish
                        </Button>
                    </Flex>
                }
            />
            <CmsPageBuilder bookOptions={bookOptions} content={content} onBeforeMediaUpload={saveNow} onChange={setContent} />
        </StaffLayout>
    );
}
