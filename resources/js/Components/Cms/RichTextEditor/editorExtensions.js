import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { CharacterCount } from "@tiptap/extensions";

export const editorExtensions = [
    StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        link: false,
        underline: false,
    }),
    Underline,
    TextAlign.configure({
        types: ['paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
    }),
    CharacterCount.configure({
        limit: 500,
        autoTrim: false,
        textCounter: (text) => [...text].length,
    }),
];
