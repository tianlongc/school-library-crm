import {
    AlignCenterOutlined,
    AlignLeftOutlined,
    AlignRightOutlined,
    BoldOutlined,
    DownOutlined,
    ItalicOutlined,
    MenuOutlined,
    OrderedListOutlined,
    RedoOutlined,
    StrikethroughOutlined,
    UnderlineOutlined,
    UndoOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Tooltip } from 'antd';
import { useEditorState } from '@tiptap/react';
import ToolbarButton from './ToolbarButton';
import { toolbarCommands } from './toolbarCommands';

const alignmentItems = [
    { key: 'alignLeft', icon: <AlignLeftOutlined />, label: 'Align left' },
    { key: 'alignCenter', icon: <AlignCenterOutlined />, label: 'Align center' },
    { key: 'alignRight', icon: <AlignRightOutlined />, label: 'Align right' },
    { key: 'alignJustify', icon: <MenuOutlined />, label: 'Justify text' },
];

const listItems = [
    { key: 'bulletList', icon: <UnorderedListOutlined />, label: 'Bulleted list' },
    { key: 'orderedList', icon: <OrderedListOutlined />, label: 'Numbered list' },
];

function MenuToolbarButton({ title, icon, items, selectedKeys = [], onCommand }) {
    return (
        <Tooltip title={title}>
            <Dropdown
                menu={{
                    items,
                    onClick: ({ key }) => onCommand(key),
                    selectedKeys,
                }}
                trigger={['click']}
            >
                <Button
                    aria-haspopup="menu"
                    aria-label={title}
                    className="rich-text-toolbar-menu-button"
                    htmlType="button"
                    icon={(
                        <span className="rich-text-toolbar-menu-icon">
                            {icon}
                            <DownOutlined className="rich-text-toolbar-menu-chevron" />
                        </span>
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    size="small"
                    type="text"
                />
            </Dropdown>
        </Tooltip>
    );
}

export default function RichTextToolbar({ editor }) {
    const editorState = useEditorState({
        editor,
        selector: ({ editor: activeEditor }) => {
            if (!activeEditor) {
                return null;
            }

            return {
                canUndo: toolbarCommands.undo.canExecute(activeEditor),
                canRedo: toolbarCommands.redo.canExecute(activeEditor),
                bold: toolbarCommands.bold.isActive(activeEditor),
                italic: toolbarCommands.italic.isActive(activeEditor),
                underline: toolbarCommands.underline.isActive(activeEditor),
                strike: toolbarCommands.strike.isActive(activeEditor),
                alignLeft: toolbarCommands.alignLeft.isActive(activeEditor),
                alignCenter: toolbarCommands.alignCenter.isActive(activeEditor),
                alignRight: toolbarCommands.alignRight.isActive(activeEditor),
                alignJustify: toolbarCommands.alignJustify.isActive(activeEditor),
                bulletList: toolbarCommands.bulletList.isActive(activeEditor),
                orderedList: toolbarCommands.orderedList.isActive(activeEditor),
                characters: activeEditor.storage.characterCount.characters(),
            };
        },
    });

    if (!editor || !editorState) {
        return null;
    }

    const run = (command) => toolbarCommands[command].execute(editor);
    const currentAlignment = editorState.alignCenter
        ? 'alignCenter'
        : editorState.alignRight
            ? 'alignRight'
            : editorState.alignJustify
                ? 'alignJustify'
                : 'alignLeft';
    const alignmentIcon = alignmentItems.find(({ key }) => key === currentAlignment).icon;
    const currentList = editorState.orderedList
        ? 'orderedList'
        : editorState.bulletList
            ? 'bulletList'
            : null;
    const listIcon = currentList === 'orderedList'
        ? <OrderedListOutlined />
        : <UnorderedListOutlined />;

    return (
        <div className="rich-text-toolbar-layout">
            <div className="rich-text-toolbar-groups">
                <div className="rich-text-toolbar-row">
                    <div aria-label="Text style" className="rich-text-toolbar-group-controls" role="group">
                        <ToolbarButton
                            title="Bold"
                            icon={<BoldOutlined />}
                            active={editorState.bold}
                            onClick={() => run('bold')}
                        />
                        <ToolbarButton
                            title="Italic"
                            icon={<ItalicOutlined />}
                            active={editorState.italic}
                            onClick={() => run('italic')}
                        />
                        <ToolbarButton
                            title="Underline"
                            icon={<UnderlineOutlined />}
                            active={editorState.underline}
                            onClick={() => run('underline')}
                        />
                        <ToolbarButton
                            title="Strikethrough"
                            icon={<StrikethroughOutlined />}
                            active={editorState.strike}
                            onClick={() => run('strike')}
                        />
                    </div>
                    <div aria-label="Lists" className="rich-text-toolbar-group-controls" role="group">
                        <MenuToolbarButton
                            title={currentList === 'orderedList' ? 'Numbered list' : 'Bulleted list'}
                            icon={listIcon}
                            items={listItems}
                            selectedKeys={currentList ? [currentList] : []}
                            onCommand={run}
                        />
                    </div>
                    <div aria-label="Text alignment" className="rich-text-toolbar-group-controls" role="group">
                        <MenuToolbarButton
                            title={alignmentItems.find(({ key }) => key === currentAlignment).label}
                            icon={alignmentIcon}
                            items={alignmentItems}
                            selectedKeys={[currentAlignment]}
                            onCommand={run}
                        />
                    </div>
                </div>

                <div className="rich-text-toolbar-row">
                    <div aria-label="History" className="rich-text-toolbar-group-controls" role="group">
                        <ToolbarButton
                            title="Undo"
                            icon={<UndoOutlined />}
                            disabled={!editorState.canUndo}
                            onClick={() => run('undo')}
                        />
                        <ToolbarButton
                            title="Redo"
                            icon={<RedoOutlined />}
                            disabled={!editorState.canRedo}
                            onClick={() => run('redo')}
                        />
                    </div>
                </div>
            </div>

            <div className="rich-text-toolbar-footer">
                <span className="rich-text-toolbar-count-label">Characters</span>
                <span
                    aria-live="polite"
                    className={`rich-text-character-count ${editorState.characters > 500 ? 'is-over-limit' : ''}`}
                    role="status"
                >
                    {editorState.characters} / 500
                </span>
            </div>
        </div>
    );
}
