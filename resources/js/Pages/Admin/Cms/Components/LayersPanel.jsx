import { CMS_BLOCK_DEFINITIONS } from '@/Utils/cmsPageDocument';
import {
    EyeInvisibleOutlined,
    EyeOutlined,
    HolderOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import {
    Button,
    Dropdown,
    Empty,
    Tooltip,
    Typography,
} from 'antd';

function LayersItem({
    block,
    blockCount,
    index,
    onMove,
    onSelect,
    onToggleVisibility,
    selected,
}) {
    const sortable = useSortable({
        id: block.id,
        index,
    });

    const definition = CMS_BLOCK_DEFINITIONS[block.type];

    return (
        <div
            ref={sortable.ref}
            className={`cms-builder-layer ${
                selected ? 'is-selected' : ''
            }`}
            style={{
                opacity: sortable.isDragging ? 0.5 : 1,
            }}
        >
            <button
                ref={sortable.handleRef}
                aria-label={`Drag ${definition.label}`}
                className="cms-builder-drag-handle"
                type="button"
            >
                <HolderOutlined />
            </button>

            <button
                className="cms-builder-layer-select"
                onClick={() => onSelect(block.id)}
                type="button"
            >
                <span className="cms-builder-layer-copy">
                    <strong>
                        {block.data.heading || definition.label}
                    </strong>

                    <small>
                        {definition.label}
                    </small>
                </span>
            </button>

            <Tooltip
                title={
                    block.is_visible === false
                        ? 'Show block'
                        : 'Hide block'
                }
            >
                <button
                    aria-label={
                        block.is_visible === false
                            ? 'Show block'
                            : 'Hide block'
                    }
                    className="cms-builder-visibility"
                    onClick={() =>
                        onToggleVisibility(block.id)
                    }
                    type="button"
                >
                    {block.is_visible === false ? (
                        <EyeInvisibleOutlined />
                    ) : (
                        <EyeOutlined />
                    )}
                </button>
            </Tooltip>
            <Dropdown
                menu={{
                    items: [
                        { key: 'up', label: 'Move up', disabled: index === 0 },
                        { key: 'down', label: 'Move down', disabled: index === blockCount - 1 },
                    ],
                    onClick: ({ key }) => onMove(block.id, key),
                }}
                trigger={['click']}
            >
                <Button
                    aria-label={`Move ${block.data.heading || definition.label}`}
                    icon={<MoreOutlined aria-hidden="true" />}
                    size="small"
                    type="text"
                />
            </Dropdown>
        </div>
    );
}

export default function LayersPanel({
    blocks,
    onChange,
    onMove,
    onSelect,
    onToggleVisibility,
    selectedId,
}) {
    if (blocks.length === 0) {
        return (
            <Empty
                description="Add a component to create your first layer."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    const handleDragEnd = (event) => {
        if (
            event.canceled ||
            !event.operation.target
        ) {
            return;
        }

        onChange(
            move(blocks, event),
        );
    };

    return (
        <div className="cms-builder-panel-body cms-builder-layers">
            <Typography.Paragraph
                type="secondary"
                className="cms-builder-help"
            >
                Select a layer, or use its menu or drag handle to reorder it.
            </Typography.Paragraph>

            <DragDropProvider
                onDragEnd={handleDragEnd}
            >
                <div className="cms-builder-layer-list">
                    {blocks.map((block, index) => (
                        <LayersItem
                            key={block.id}
                            block={block}
                            blockCount={blocks.length}
                            index={index}
                            onMove={onMove}
                            onSelect={onSelect}
                            onToggleVisibility={
                                onToggleVisibility
                            }
                            selected={
                                selectedId === block.id
                            }
                        />
                    ))}
                </div>
            </DragDropProvider>
        </div>
    );
}
