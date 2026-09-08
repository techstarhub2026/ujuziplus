"use client";

import { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Code, Code2, Minus, Link2, ImageIcon,
  Undo, Redo,
} from "lucide-react";
import { useState } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  onImageUpload?: (file: File) => Promise<string>;
};

function ToolBtn({
  active, disabled, title, onClick, children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`h-7 w-7 flex items-center justify-center rounded transition-colors text-sm
        ${active
          ? "bg-brand/15 text-brand"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
        ${disabled ? "opacity-30 pointer-events-none" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />;
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 200, onImageUpload }: Props) {
  const [linkModal, setLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        code: {},
        codeBlock: { HTMLAttributes: { class: "not-prose bg-gray-900 text-green-300 font-mono p-4 rounded-lg text-sm overflow-x-auto" } },
        blockquote: { HTMLAttributes: { class: "border-l-4 border-brand/40 pl-4 italic text-gray-600" } },
        link: false,
        underline: false,
      }),
      Underline,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-brand underline hover:text-brand/80", rel: "noopener noreferrer" },
      }),
      ImageExt.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full my-3 shadow-sm" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none px-4 py-3",
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "");
    }
  }, [value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkUrl("");
    setLinkModal(false);
  }, [editor, linkUrl]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (onImageUpload) {
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    }
    e.target.value = "";
  }, [editor, onImageUpload]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand transition-colors bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/80">
        {/* Undo / Redo */}
        <ToolBtn title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-3.5 w-3.5" />
        </ToolBtn>
        <Divider />

        {/* Block type */}
        <ToolBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-3.5 w-3.5" />
        </ToolBtn>
        <Divider />

        {/* Inline marks */}
        <ToolBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="h-3.5 w-3.5" />
        </ToolBtn>
        <Divider />

        {/* Align */}
        <ToolBtn title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="h-3.5 w-3.5" />
        </ToolBtn>
        <Divider />

        {/* Lists & blocks */}
        <ToolBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Block quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 className="h-3.5 w-3.5" />
        </ToolBtn>
        <ToolBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-3.5 w-3.5" />
        </ToolBtn>
        <Divider />

        {/* Link */}
        <ToolBtn title="Insert link" active={editor.isActive("link")} onClick={() => { setLinkUrl(editor.getAttributes("link").href ?? ""); setLinkModal(!linkModal); }}>
          <Link2 className="h-3.5 w-3.5" />
        </ToolBtn>

        {/* Image (only when upload handler provided) */}
        {onImageUpload && (
          <label title="Insert image" className="h-7 w-7 flex items-center justify-center rounded cursor-pointer text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <ImageIcon className="h-3.5 w-3.5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        )}
      </div>

      {/* Link input bar */}
      {linkModal && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-blue-50/60">
          <input
            autoFocus
            type="url"
            placeholder="https://"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setLink()}
            className="flex-1 rounded-lg border border-blue-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button type="button" onClick={setLink} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90">
            Apply
          </button>
          {editor.isActive("link") && (
            <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkModal(false); }} className="text-xs text-red-500 hover:underline">
              Remove
            </button>
          )}
          <button type="button" onClick={() => setLinkModal(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
