"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlock from "@tiptap/extension-code-block";
import Youtube from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

interface MediaItem {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  alt_text?: string;
  caption?: string;
  width?: number;
  height?: number;
  created_at: string;
}

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function ArticleEditor({ content, onChange }: Props) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaLoading, setMediaLoading] = useState(false);
  const [insertMode, setInsertMode] = useState<"image" | "featured">("image");

  const fetchMedia = useCallback(async () => {
    setMediaLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (mediaSearch) params.set("search", mediaSearch);
    const res = await fetch(`/api/media?${params.toString()}`);
    const data = await res.json();
    setMediaItems(data.media || []);
    setMediaLoading(false);
  }, [mediaSearch]);

  useEffect(() => {
    if (showMediaPicker) fetchMedia();
  }, [showMediaPicker, fetchMedia]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Start writing your article...",
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      Typography,
      CharacterCount,
      CodeBlock,
      Youtube.configure({
        width: 640,
        height: 360,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  function insertImage(url: string, alt?: string) {
    if (editor) {
      editor.chain().focus().setImage({ src: url, alt: alt || "" }).run();
    }
    setShowMediaPicker(false);
  }

  function insertYoutube() {
    const url = window.prompt("Enter YouTube URL:");
    if (url && editor) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }

  if (!editor) return <div className="editor-loading">Loading editor...</div>;

  const wordCount = editor.storage.characterCount?.words() ?? 0;
  const charCount = editor.storage.characterCount?.characters() ?? 0;

  return (
    <div className="tiptap-editor">
      <div className="editor-toolbar">
        {/* Text formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "active" : ""}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "active" : ""}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "active" : ""}
          title="Underline"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "active" : ""}
          title="Strikethrough"
        >
          S
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive("highlight") ? "active" : ""}
          title="Highlight"
        >
          Hl
        </button>

        <span className="toolbar-divider" />

        {/* Headings */}
        {[1, 2, 3, 4].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run()
            }
            className={
              editor.isActive("heading", { level }) ? "active" : ""
            }
          >
            H{level}
          </button>
        ))}

        <span className="toolbar-divider" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "active" : ""}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "active" : ""}
          title="Numbered List"
        >
          1. List
        </button>

        <span className="toolbar-divider" />

        {/* Block elements */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "active" : ""}
          title="Blockquote"
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "active" : ""}
          title="Code Block"
        >
          Code
        </button>

        <span className="toolbar-divider" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "active" : ""}
          title="Align Left"
        >
          ≡L
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "active" : ""}
          title="Align Center"
        >
          ≡C
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "active" : ""}
          title="Align Right"
        >
          ≡R
        </button>

        <span className="toolbar-divider" />

        {/* Media */}
        <button
          type="button"
          onClick={() => {
            setInsertMode("image");
            setShowMediaPicker(true);
          }}
          title="Insert Image from Library"
        >
          📷 Image
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Enter image URL:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          title="Insert Image by URL"
        >
          🔗 URL
        </button>
        <button type="button" onClick={insertYoutube} title="Embed YouTube">
          ▶ YT
        </button>

        <span className="toolbar-divider" />

        {/* Links & Blocks */}
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Enter link URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          title="Insert Link"
        >
          🔗 Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          ― HR
        </button>

        {/* Table */}
        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Insert Table"
        >
          ▦ Table
        </button>

        {/* Undo/Redo */}
        <span className="toolbar-divider" />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          ↷
        </button>
      </div>

      <EditorContent editor={editor} className="editor-content" />

      <div className="editor-footer">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>

      {/* Media Library Picker Modal */}
      {showMediaPicker && (
        <div className="modal-overlay" onClick={() => setShowMediaPicker(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>Media Library</h2>
            <div className="admin-filters">
              <input
                type="text"
                placeholder="Search images..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchMedia()}
              />
            </div>

            {mediaLoading ? (
              <div className="admin-content">Loading...</div>
            ) : mediaItems.length > 0 ? (
              <div className="media-grid">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="media-card"
                    onClick={() => insertImage(item.file_url, item.alt_text)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.file_url}
                      alt={item.alt_text || item.file_name}
                      loading="lazy"
                    />
                    <div className="media-info">
                      <span className="media-name">{item.file_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No media found.</div>
            )}

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowMediaPicker(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
