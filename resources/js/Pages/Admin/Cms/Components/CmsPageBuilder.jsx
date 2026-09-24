import StudentPortalCmsContent from '@/Components/Cms/StudentPortalCmsContent';
import RichTextEditor from '@/Components/Cms/RichTextEditor/RichTextEditor';
import { CMS_BLOCK_DEFINITIONS, createCmsBlock, duplicateCmsBlock, insertCmsBlockAfter, insertCmsBlockAt, isCanvasBackgroundDropActive, mergeCmsBlockData, moveCmsBlock, resolveCanvasDropIndex, shiftCmsBlock, toggleCmsBlockVisibility } from '@/Utils/cmsPageDocument';
import { jsonRequest } from '@/Utils/jsonRequest';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { BookOutlined, CopyOutlined, DeleteOutlined, DesktopOutlined, EyeInvisibleOutlined, EyeOutlined, FontSizeOutlined, HolderOutlined, LayoutOutlined, LinkOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MobileOutlined, NotificationOutlined, FileImageOutlined , PlusOutlined, TabletOutlined } from '@ant-design/icons';
import { DragDropProvider, useDragOperation, useDraggable, useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Button, Drawer, Dropdown, Empty, Flex, Grid, Input, Popconfirm, Segmented, Select, Tabs, Tooltip, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import LayersPanel from './LayersPanel';

const BLOCK_ICONS = {
    hero: LayoutOutlined,
    announcement: NotificationOutlined,
    book_collection: BookOutlined,
    rich_text: FontSizeOutlined,
    call_to_action: LinkOutlined,
    image: FileImageOutlined,
};

const PREVIEW_OPTIONS = [
    { label: 'Desktop', value: 'desktop', icon: <DesktopOutlined /> },
    { label: 'Tablet', value: 'tablet', icon: <TabletOutlined /> },
    { label: 'Mobile', value: 'mobile', icon: <MobileOutlined /> },
];

function ComponentItem({ definition, onAdd, type, compact = false }) {
    const draggable = useDraggable({
        id: `library:${type}`,
        data: {
            kind: 'library',
            type,
        },
    });
    const Icon = BLOCK_ICONS[type];
    const addFromClick = (event) => {
        if (event.defaultPrevented) {
            return;
        }

        onAdd(type);
    };

    if (compact) {
        return (
            <Tooltip title={`Click to add ${definition.label} after the selected block. Drag onto the canvas to position it.`} placement="right">
                <button
                    ref={draggable.ref}
                    aria-label={`Add ${definition.label}`}
                    className="cms-builder-component-compact"
                    onClick={addFromClick}
                    style={{
                        opacity: draggable.isDragging ? 0.5 : 1,
                    }}
                    type="button"
                >
                    <span className="cms-builder-component-compact-icon">
                        <Icon aria-hidden="true" />
                    </span>
                </button>
            </Tooltip>
        );
    }

    return (
        <button ref={draggable.ref} className="cms-builder-component" onClick={addFromClick} style={{ opacity: draggable.isDragging ? 0.5 : 1 }} type="button">
            <span className="cms-builder-component-icon"><Icon aria-hidden="true" /></span>
            <span className="cms-builder-component-copy"><strong>{definition.label}</strong><small>{definition.description}</small></span>
            <PlusOutlined aria-hidden="true" className="cms-builder-component-add-icon" />
        </button>
    );
}

function ComponentLibrary({ onAdd }) {
    return (
        <div className="cms-builder-panel-body">
            <Typography.Text className="cms-builder-panel-label">Components</Typography.Text>
            <Typography.Paragraph type="secondary" className="cms-builder-help">Click a component to add it after the selected block, or at the end if none is selected. Drag it onto the canvas to choose its position.</Typography.Paragraph>
            <div className="cms-builder-component-list">
                {Object.entries(CMS_BLOCK_DEFINITIONS).map(([type, definition]) => (
                    <ComponentItem key={type} definition={definition} onAdd={onAdd} type={type} />
                ))}
            </div>
        </div>
    );
}

function CompactComponentRail({ onAdd }) {
    return (
        <div className="cms-builder-compact-rail">
            {Object.entries(CMS_BLOCK_DEFINITIONS).map(
                ([type, definition]) => (
                    <ComponentItem
                        key={type}
                        compact
                        definition={definition}
                        onAdd={onAdd}
                        type={type}
                    />
                ),
            )}
        </div>
    );
}

function CanvasDropZone({ blockId, index, position }) {
    const droppable = useDroppable({
        id: `canvas-slot:${blockId}:${position}`,
        collisionPriority: 4,
        data: {
            kind: 'canvas-slot',
            index: position === 'before' ? index : index + 1,
        },
    });

    return (
        <div
            ref={droppable.ref}
            aria-hidden="true"
            className={`cms-builder-drop-zone is-${position} ${droppable.isDropTarget ? 'is-drop-target' : ''}`}
        />
    );
}

function CanvasBlock({ block, bookOptions, index, onAddAfter, onDelete, onDuplicate, onSelect, onToggleVisibility, selected }) {
    const sortable = useSortable({ id: block.id, index, group: 'canvas', data: { kind: 'canvas', index } });
    const addMenu = {
        items: Object.entries(CMS_BLOCK_DEFINITIONS).map(([type, definition]) => {
            const Icon = BLOCK_ICONS[type];

            return { key: type, icon: <Icon />, label: definition.label };
        }),
        onClick: ({ key }) => onAddAfter(block.id, key),
    };

    return (
        <div ref={sortable.ref} aria-label={`${CMS_BLOCK_DEFINITIONS[block.type].label} block`} className={`cms-builder-canvas-block ${selected ? 'is-selected' : ''} ${block.is_visible === false ? 'is-hidden' : ''}`} onClick={() => onSelect(block.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(block.id); } }} role="group" style={{ opacity: sortable.isDragging ? 0.45 : undefined }} tabIndex={0}>
            <CanvasDropZone blockId={block.id} index={index} position="before" />
            <CanvasDropZone blockId={block.id} index={index} position="after" />
            <div
                className="cms-builder-block-toolbar"
                onClick={(event) => {
                    event.stopPropagation();
                    onSelect(block.id);
                }}
            >
                <div className="cms-builder-block-toolbar-title">
                    <button
                        ref={sortable.handleRef}
                        aria-label={`Drag ${CMS_BLOCK_DEFINITIONS[block.type].label}`}
                        className="cms-builder-block-drag"
                        onFocus={() => onSelect(block.id)}
                        type="button"
                    >
                        <HolderOutlined />
                    </button>

                    <span>
                        {CMS_BLOCK_DEFINITIONS[block.type].label}
                    </span>
                </div>

                <div className="cms-builder-block-actions" onClick={(event) => event.stopPropagation()}>
                    <Tooltip
                        title={
                            block.is_visible === false
                                ? 'Show block'
                                : 'Hide block'
                        }
                    >
                        <Button
                            aria-label={
                                block.is_visible === false
                                    ? 'Show block'
                                    : 'Hide block'
                            }
                            icon={
                                block.is_visible === false
                                    ? <EyeInvisibleOutlined />
                                    : <EyeOutlined />
                            }
                            onClick={() => onToggleVisibility(block.id)}
                            size="small"
                            type="text"
                        />
                    </Tooltip>

                    <Tooltip title="Duplicate block">
                        <Button
                            aria-label="Duplicate block"
                            icon={<CopyOutlined />}
                            onClick={() => onDuplicate(block.id)}
                            size="small"
                            type="text"
                        />
                    </Tooltip>

                    <Popconfirm
                        description="This removes the block from the autosaved draft."
                        okButtonProps={{ danger: true }}
                        okText="Delete block"
                        onConfirm={() => onDelete(block.id)}
                        title="Delete this block?"
                    >
                        <Button
                            aria-label={`Delete ${CMS_BLOCK_DEFINITIONS[block.type].label} block`}
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            type="text"
                        />
                    </Popconfirm>
                </div>
            </div>

            <div className="cms-builder-block-content">
                {block.type === 'image' && !block.data.media_url ? (
                    <div className="cms-builder-image-placeholder">
                        <FileImageOutlined aria-hidden="true" />
                        <strong>No image selected</strong>
                        <span>Choose an image in block settings.</span>
                    </div>
                ) : (
                    <StudentPortalCmsContent books={bookOptions} content={{ schema_version: 1, blocks: [{ ...block, is_visible: true }] }} />
                )}
            </div>
            {selected && <div className="cms-builder-add-below" onClick={(event) => event.stopPropagation()}><Dropdown menu={addMenu} placement="bottom"><Button className="cms-builder-add-button" icon={<PlusOutlined />} size="small" type="primary">Add below</Button></Dropdown></div>}
        </div>
    );
}

function EmptyCanvas() {
    const droppable = useDroppable({ id: 'canvas-empty', data: { kind: 'canvas', index: 0 } });

    return <div ref={droppable.ref} className={`cms-builder-canvas-empty ${droppable.isDropTarget ? 'is-drop-target' : ''}`}><Empty description="Drag a component here or choose one from the library." /></div>;
}

function CanvasSurface({ bookOptions, content, onAddAfter, onDelete, onDuplicate, onSelect, onToggleVisibility, preview, selectedId }) {
    const droppable = useDroppable({
        id: 'canvas-background',
        collisionPriority: 1,
        data: { kind: 'canvas-background', index: content.blocks.length },
    });
    const { source, target } = useDragOperation();
    const isDragging = Boolean(source);
    const isBackgroundTarget = isCanvasBackgroundDropActive(source, target);

    return (
        <div
            ref={droppable.ref}
            className={`cms-builder-canvas is-${preview} ${isDragging ? 'is-dragging' : ''} ${isBackgroundTarget ? 'is-background-target' : ''}`}
        >
            {content.blocks.length === 0 ? <EmptyCanvas /> :
                content.blocks.map((block, index) =>
                    <CanvasBlock
                        key={block.id}
                        block={block}
                        bookOptions={bookOptions}
                        index={index}
                        onAddAfter={onAddAfter}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                        onSelect={onSelect}
                        onToggleVisibility={onToggleVisibility}
                        selected={selectedId === block.id}
                    />
                )
            }
            {isDragging && (
                <div className="cms-builder-canvas-end-hint">
                    <PlusOutlined aria-hidden="true" />
                    <span>{isBackgroundTarget ? 'Release to drop at end' : 'Drop on the canvas background to add at end'}</span>
                </div>
            )}
        </div>
    );
}

function Inspector({ block, bookOptions, onBeforeMediaUpload, onChange }) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const imageInputRef = useRef(null);

    if (!block) {
        return <div className="cms-builder-empty-panel"><Empty description="Select a canvas block to edit it." image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>;
    }

    const updateData = (field, value) => onChange({ [field]: value });
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        setUploadError('');

        try {
            await onBeforeMediaUpload();
            const payload = await jsonRequest({
                url: route('admin.cms.media.store'),
                method: 'POST',
                data: formData,
            });
            onChange({
                media_uuid: payload.media.uuid,
                media_url: payload.media.url,
            });
        } catch (error) {
            setUploadError(getRequestErrorMessage(error, 'The image could not be uploaded.'));
        } finally {
            setUploading(false);
        }
    };
    const removeImage = () => onChange({
        media_uuid: null,
        media_url: undefined,
    });
    const supportsRichText = ['hero', 'announcement', 'rich_text'].includes(block.type);

    return (
        <div className="cms-builder-inspector-fields">
            {'eyebrow' in block.data && <label className="cms-builder-field"><span>Eyebrow</span><Input maxLength={120} value={block.data.eyebrow} onChange={(event) => updateData('eyebrow', event.target.value)} /></label>}
            {'heading' in block.data && <label className="cms-builder-field"><span>Heading</span><Input maxLength={255} value={block.data.heading} onChange={(event) => updateData('heading', event.target.value)} /></label>}
            {'body' in block.data && !supportsRichText && <label className="cms-builder-field"><span>Body</span><Input.TextArea showCount autoSize={{ minRows: 4, maxRows: 10 }} maxLength={500} value={block.data.body} onChange={(event) => updateData('body', event.target.value)} /></label>}
            {supportsRichText && (
                <div className="cms-builder-field">
                    <span>Body</span>
                    <p className="cms-builder-field-hint">
                        Select text to format. Lists and alignment apply to this paragraph. Drafts autosave; students see changes after Publish.
                    </p>
                    <RichTextEditor
                        key={block.id}
                        format={block.data.body_format ?? 'text'}
                        onChange={(body) => onChange({ body, body_format: 'html' })}
                        value={block.data.body}
                    />
                </div>
            )}
            {(block.type === 'hero' || block.type === 'image') && (
                <div className="cms-builder-field">
                    <span>Image</span>
                    {block.data.media_url && <img alt="Current block image" className="w-full rounded-lg object-cover" src={block.data.media_url} />}
                    <input
                        accept="image/jpeg,image/png,image/webp"
                        aria-label="Choose block image"
                        className="sr-only"
                        disabled={uploading}
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) uploadImage(file);
                            event.target.value = '';
                        }}
                        ref={imageInputRef}
                        tabIndex={-1}
                        type="file"
                    />
                    <Button disabled={uploading} onClick={() => imageInputRef.current?.click()}>
                        {uploading ? 'Uploading image…' : block.data.media_uuid ? 'Replace image' : 'Choose image'}
                    </Button>
                    <Typography.Text type="secondary">JPEG, PNG or WebP. Maximum 5 MB.</Typography.Text>
                    {uploadError && <Typography.Text role="alert" type="danger">{uploadError}</Typography.Text>}
                    {block.data.media_uuid && <Button danger disabled={uploading} onClick={removeImage} size="small">Remove image</Button>}
                </div>
            )}
            {'alt' in block.data && <label className="cms-builder-field"><span>Alternative text</span><Input maxLength={255} value={block.data.alt} onChange={(event) => updateData('alt', event.target.value)} /></label>}
            {'book_ids' in block.data && <label className="cms-builder-field"><span>Books</span><Select maxCount={12} maxTagCount="responsive" maxTagTextLength={24} mode="multiple" onChange={(value) => updateData('book_ids', value)} options={bookOptions} placeholder="Choose up to 12 books" showSearch={{ optionFilterProp: 'label' }} value={block.data.book_ids} /></label>}
            {'label' in block.data && <label className="cms-builder-field"><span>Button label</span><Input maxLength={120} value={block.data.label} onChange={(event) => updateData('label', event.target.value)} /></label>}
            {'target' in block.data && <label className="cms-builder-field"><span>Button destination</span><Select onChange={(value) => updateData('target', value)} options={[{ label: 'Book catalogue', value: 'catalogue' }, { label: 'Member account', value: 'account' }]} value={block.data.target} /></label>}
        </div>
    );
}

export default function CmsPageBuilder({ bookOptions, content, onBeforeMediaUpload = async () => {}, onChange }) {
    const [selectedId, setSelectedId] = useState(content.blocks[0]?.id ?? null);
    const [preview, setPreview] = useState('desktop');
    const [libraryCollapsed, setLibraryCollapsed] = useState(false);
    const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
    const selectedBlock = useMemo(() => content.blocks.find(({ id }) => id === selectedId) ?? null, [content.blocks, selectedId]);
    const screens = Grid.useBreakpoint();

    const isMobile = screens.md === false;
    const isTablet = screens.md === true && screens.lg === false;

    const [mobileLibraryOpen, setMobileLibraryOpen] = useState(false);

    const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

    useEffect(() => {
        if (selectedId && !content.blocks.some(({ id }) => id === selectedId)) {
            setSelectedId(content.blocks[0]?.id ?? null);
        }
    }, [content.blocks, selectedId]);

    useEffect(() => {
        if (!isTablet) {
            return;
        }

        setLibraryCollapsed(true);
        setInspectorCollapsed(true);
    }, [isTablet]);

    useEffect(() => {
        if (isMobile) {
            setPreview('mobile');
        }
    }, [isMobile]);

    const addBlock = (type) => {
        const block = createCmsBlock(type);
        onChange((currentContent) => insertCmsBlockAfter(currentContent, selectedId, block));
        setSelectedId(block.id);

        if (isMobile) {
            setMobileLibraryOpen(false);
        }
    };

    const addBlockAfter = (blockId, type) => {
        const block = createCmsBlock(type);
        onChange(insertCmsBlockAfter(content, blockId, block));
        setSelectedId(block.id);
    };

    const updateBlockData = (blockId, dataPatch) =>
        onChange((currentContent) => mergeCmsBlockData(currentContent, blockId, dataPatch));
    const deleteBlock = (blockId) => onChange({ ...content, blocks: content.blocks.filter(({ id }) => id !== blockId) });
    const toggleBlockVisibility = (blockId) => onChange(toggleCmsBlockVisibility(content, blockId));
    const duplicateBlock = (blockId) => {
        const nextContent = duplicateCmsBlock(content, blockId);
        const sourceIndex = content.blocks.findIndex(({ id }) => id === blockId);
        onChange(nextContent);
        setSelectedId(nextContent.blocks[sourceIndex + 1].id);
    };
    const updateCanvasFromDrag = (event) => {
        if (event.canceled) {
            return;
        }

        const { source, target } = event.operation;
        const targetIndex = resolveCanvasDropIndex(target, content.blocks.length);

        if (source.data?.kind === 'library') {
            const block = createCmsBlock(source.data.type);
            onChange(insertCmsBlockAt(content, block, targetIndex));
            setSelectedId(block.id);
            return;
        }

        if (source.data?.kind === 'canvas') {
            onChange(moveCmsBlock(content, source.id, targetIndex));
        }
    };

    const libraryTabs = [
        {
            key: 'components',
            label: 'Components',
            children: <ComponentLibrary onAdd={addBlock} />,
        },
        {
            key: 'layers',
            label: `Layers (${content.blocks.length})`,
            children: (
                <LayersPanel
                    blocks={content.blocks}
                    selectedId={selectedId}
                    onSelect={(blockId) => {
                        setSelectedId(blockId);

                        if (isMobile) {
                            setMobileLibraryOpen(false);
                        }
                    }}
                    onToggleVisibility={toggleBlockVisibility}
                    onMove={(blockId, direction) =>
                        onChange((currentContent) => shiftCmsBlock(currentContent, blockId, direction))
                    }
                    onChange={(blocks) => onChange({ ...content, blocks })}
                />
            ),
        },
    ];

    return (
        <DragDropProvider onDragEnd={updateCanvasFromDrag}>
        <div className={`cms-builder-workspace ${libraryCollapsed ? 'is-library-collapsed' : ''} ${inspectorCollapsed ? 'is-inspector-collapsed' : ''}`}>
            {!isMobile && (
                <aside className="cms-builder-panel cms-builder-library">
                    {libraryCollapsed ? (
                        <>
                            <div className="cms-builder-side-header is-collapsed">
                                <Tooltip title="Expand content panel">
                                    <Button aria-label="Expand content panel" icon={<MenuUnfoldOutlined />} onClick={() => setLibraryCollapsed(false)} size="small" type="text" />
                                </Tooltip>
                            </div>
                            <div className="cms-builder-panel-scroll">
                                <CompactComponentRail onAdd={addBlock} />
                            </div>
                        </>
                    ) : (
                        <Tabs
                            className="cms-builder-sidebar-tabs"
                            defaultActiveKey="components"
                            items={libraryTabs}
                            tabBarExtraContent={(
                                <Tooltip title="Collapse content panel">
                                    <Button aria-label="Collapse content panel" icon={<MenuFoldOutlined />} onClick={() => setLibraryCollapsed(true)} size="small" type="text" />
                                </Tooltip>
                            )}
                        />
                    )}
                </aside>
            )}
            <main className="cms-builder-canvas-wrap">
                <div className="cms-builder-canvas-toolbar">
                    <Typography.Text strong>Student portal canvas</Typography.Text>
                    <Flex align="center" gap={8} wrap>
                        {isMobile && (
                            <>
                                <Button icon={<PlusOutlined />} onClick={() => setMobileLibraryOpen(true)} size="small">Blocks</Button>
                                <Button disabled={!selectedBlock} onClick={() => setMobileInspectorOpen(true)} size="small">Settings</Button>
                            </>
                        )}
                        <Segmented aria-label="Preview size" onChange={setPreview} options={PREVIEW_OPTIONS} size="small" value={preview} />
                    </Flex>
                </div>
                <CanvasSurface
                    bookOptions={bookOptions}
                    content={content}
                    onAddAfter={addBlockAfter}
                    onDelete={deleteBlock}
                    onDuplicate={duplicateBlock}
                    onSelect={setSelectedId}
                    onToggleVisibility={toggleBlockVisibility}
                    preview={preview}
                    selectedId={selectedId}
                />
            </main>
            {!isMobile && (
                <aside className="cms-builder-panel cms-builder-inspector">
                    <div className={`cms-builder-side-header ${inspectorCollapsed ? 'is-collapsed' : ''}`}>
                        {!inspectorCollapsed && (
                            <div className="cms-builder-inspector-heading">
                                <Typography.Text className="cms-builder-panel-label">Block settings</Typography.Text>
                                <Typography.Text type="secondary">{selectedBlock ? CMS_BLOCK_DEFINITIONS[selectedBlock.type].label : 'No block selected'}</Typography.Text>
                            </div>
                        )}
                        <Tooltip title={inspectorCollapsed ? 'Expand block settings' : 'Collapse block settings'}>
                            <Button aria-label={inspectorCollapsed ? 'Expand block settings' : 'Collapse block settings'} icon={inspectorCollapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />} onClick={() => setInspectorCollapsed((collapsed) => !collapsed)} size="small" type="text" />
                        </Tooltip>
                    </div>
                    {inspectorCollapsed ? (
                        <span className="cms-builder-collapsed-label">Settings</span>
                    ) : (
                        <div className="cms-builder-panel-scroll">
                            <Inspector block={selectedBlock} bookOptions={bookOptions} onBeforeMediaUpload={onBeforeMediaUpload} onChange={(dataPatch) => updateBlockData(selectedBlock.id, dataPatch)} />
                        </div>
                    )}
                </aside>
            )}

            {isMobile && (
                <>
                    <Drawer open={mobileLibraryOpen} onClose={() => setMobileLibraryOpen(false)} placement="left" size="min(90vw, 340px)" title="Page blocks">
                        <Tabs defaultActiveKey="components" items={libraryTabs} />
                    </Drawer>
                    <Drawer open={mobileInspectorOpen} onClose={() => setMobileInspectorOpen(false)} placement="right" size="min(92vw, 380px)" title={selectedBlock ? `Block settings · ${CMS_BLOCK_DEFINITIONS[selectedBlock.type].label}` : 'Block settings'}>
                        <Inspector block={selectedBlock} bookOptions={bookOptions} onBeforeMediaUpload={onBeforeMediaUpload} onChange={(dataPatch) => updateBlockData(selectedBlock.id, dataPatch)} />
                    </Drawer>
                </>
            )}
        </div>
        </DragDropProvider>
    );
}
