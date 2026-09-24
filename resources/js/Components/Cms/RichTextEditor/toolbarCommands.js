export const toolbarCommands = {
    undo: {
        execute: (editor) =>
            editor.chain().focus().undo().run(),

        canExecute: (editor) =>
            editor.can().chain().focus().undo().run(),
    },

    redo: {
        execute: (editor) =>
            editor.chain().focus().redo().run(),

        canExecute: (editor) =>
            editor.can().chain().focus().redo().run(),
    },

    bold: {
        execute: (editor) =>
            editor.chain().focus().toggleBold().run(),

        isActive: (editor) =>
            editor.isActive('bold'),
    },

    italic: {
        execute: (editor) =>
            editor.chain().focus().toggleItalic().run(),

        isActive: (editor) =>
            editor.isActive('italic'),
    },

    underline: {
        execute: (editor) =>
            editor.chain().focus().toggleUnderline().run(),

        isActive: (editor) =>
            editor.isActive('underline'),
    },

    strike: {
        execute: (editor) =>
            editor.chain().focus().toggleStrike().run(),

        isActive: (editor) =>
            editor.isActive('strike'),
    },

    alignLeft: {
        execute: (editor) =>
            editor.chain().focus().setTextAlign('left').run(),

        isActive: (editor) =>
            editor.isActive({ textAlign: 'left' })
    },

    alignCenter: {
        execute: (editor) =>
            editor.chain().focus().setTextAlign('center').run(),

        isActive: (editor) =>
            editor.isActive({ textAlign: 'center' })
    },

    alignRight: {
        execute: (editor) =>
            editor.chain().focus().setTextAlign('right').run(),

        isActive: (editor) =>
            editor.isActive({ textAlign: 'right' })
    },

    alignJustify: {
        execute: (editor) =>
            editor.chain().focus().setTextAlign('justify').run(),

        isActive: (editor) =>
            editor.isActive({ textAlign: 'justify' })
    },

    bulletList: {
        execute: (editor) =>
            editor.chain().focus().toggleBulletList().run(),

        isActive: (editor) =>
            editor.isActive('bulletList')
    },

    orderedList: {
        execute: (editor) =>
            editor.chain().focus().toggleOrderedList().run(),

        isActive: (editor) =>
            editor.isActive('orderedList')
    },
};
