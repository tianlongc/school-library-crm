import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import RichTextToolbar from './RichTextToolbar';
import { editorExtensions } from './editorExtensions';

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getEditorContent(value, format) {
    const body = typeof value === 'string' ? value : '';

    if (format === 'html') {
        return body || '<p></p>';
    }

    return body
        .split(/\r\n|\r|\n/)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join('');
}

export default function RichTextEditor({ value = '', format = 'text', onChange }) {
    const onChangeRef = useRef(onChange);
    const initialContentRef = useRef(getEditorContent(value, format));

    onChangeRef.current = onChange;

    const editor = useEditor(
        {
            extensions: editorExtensions,
            content: initialContentRef.current,
            immediatelyRender: false,
            editorProps: {
                attributes: {
                    'aria-label': 'Rich text body',
                },
            },
            onUpdate: ({ editor: activeEditor }) => {
                onChangeRef.current?.(activeEditor.getHTML());
            },
        },
        [],
    );
    useEffect(() => {
        if (!editor) {
            return;
        }

        const nextContent = getEditorContent(value, format);

        if (editor.getHTML() !== nextContent) {
            editor.commands.setContent(nextContent, { emitUpdate: false });
        }
    }, [editor, format, value]);

    if (!editor) {
        return null;
    }

    return (
        <div className="rich-text-editor">
            <div className="rich-text-toolbar">
                <RichTextToolbar editor={editor} />
            </div>
            <EditorContent className="rich-text-content" editor={editor} />
        </div>
    );
}
