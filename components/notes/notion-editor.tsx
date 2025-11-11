'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Palette,
  GripVertical,
  Plus,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import BlockHandleMenu from './block-handle-menu';
import { SlashCommand } from './slash-command-extension';

const ImageUploadDropdown = dynamic(() => import('./image-upload-dropdown'), { ssr: false });

const textColors = [
  { name: 'Mặc định', color: '#000000' },
  { name: 'Xám', color: '#6B7280' },
  { name: 'Nâu', color: '#92400E' },
  { name: 'Cam', color: '#EA580C' },
  { name: 'Vàng', color: '#EAB308' },
  { name: 'Xanh lá', color: '#16A34A' },
  { name: 'Xanh dương', color: '#2563EB' },
  { name: 'Tím', color: '#9333EA' },
  { name: 'Hồng', color: '#EC4899' },
  { name: 'Đỏ', color: '#DC2626' },
];

interface NotionEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function NotionEditor({
  content,
  onChange,
  placeholder = 'Gõ / để chọn hoặc bắt đầu viết...',
}: NotionEditorProps) {
  const [showImageDropdown, setShowImageDropdown] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showBubbleMenu, setShowBubbleMenu] = useState(false);
  const [bubbleMenuPosition, setBubbleMenuPosition] = useState({ top: 0, left: 0 });
  const [blockMenuPosition, setBlockMenuPosition] = useState({ top: 0, left: 0 });
  const imageButtonRef = useRef<HTMLButtonElement>(null);
  const bubbleMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      SlashCommand,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4 mx-auto block',
          loading: 'lazy',
        },
      }),
      Underline,
      TextStyle,
      Color,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-3 py-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-3 py-2 bg-gray-50 font-semibold',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-4 border-gray-300',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none p-8 min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Block handles logic
  useEffect(() => {
    if (!editor) return;

    const editorElement = document.querySelector('.ProseMirror');
    if (!editorElement) return;

    let currentHandle: HTMLDivElement | null = null;
    let hoverBlock: Element | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as Element;
      const block = target.closest('.ProseMirror > *');
      
      if (block && block !== hoverBlock) {
        // Remove old handle
        if (currentHandle) {
          currentHandle.remove();
        }

        // Create new handle
        hoverBlock = block;
        const handle = document.createElement('div');
        handle.className = 'block-handle visible';
        handle.innerHTML = `
          <button class="add-block" title="Thêm block (gõ /)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="block-menu" title="Menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="5" r="1"></circle>
              <circle cx="9" cy="12" r="1"></circle>
              <circle cx="9" cy="19" r="1"></circle>
              <circle cx="15" cy="5" r="1"></circle>
              <circle cx="15" cy="12" r="1"></circle>
              <circle cx="15" cy="19" r="1"></circle>
            </svg>
          </button>
        `;

        block.appendChild(handle);
        currentHandle = handle;

        // Add event listeners
        const addBtn = handle.querySelector('.add-block');
        const menuBtn = handle.querySelector('.block-menu');

        addBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          const pos = editor.view.posAtDOM(block, 0);
          editor.chain().focus().insertContentAt(pos, '/').run();
        });

        menuBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          const rect = (menuBtn as HTMLElement).getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          setBlockMenuPosition({
            top: rect.bottom + scrollTop + 4,
            left: rect.left + scrollLeft,
          });
          setShowBlockMenu(true);
        });
      }
    };

    const handleMouseLeave = () => {
      if (currentHandle) {
        currentHandle.remove();
        currentHandle = null;
        hoverBlock = null;
      }
    };

    editorElement.addEventListener('mousemove', handleMouseMove);
    editorElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      editorElement.removeEventListener('mousemove', handleMouseMove);
      editorElement.removeEventListener('mouseleave', handleMouseLeave);
      if (currentHandle) {
        currentHandle.remove();
      }
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const updateBubbleMenu = () => {
      const { selection } = editor.state;
      const { from, to } = selection;

      // Show bubble menu only if text is selected
      if (from === to) {
        setShowBubbleMenu(false);
        return;
      }

      // Get selection coordinates
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // Position above selection
      const top = start.top + scrollTop - 50; // 50px above
      const left = (start.left + end.left) / 2 + scrollLeft - 150; // Center, offset for width

      setBubbleMenuPosition({ top, left });
      setShowBubbleMenu(true);
    };

    editor.on('selectionUpdate', updateBubbleMenu);
    editor.on('update', updateBubbleMenu);

    return () => {
      editor.off('selectionUpdate', updateBubbleMenu);
      editor.off('update', updateBubbleMenu);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const handleImageInsert = (url: string) => {
    if (editor) {
      console.log('🖼️ Inserting image:', url);
      
      const img = new window.Image();
      img.onload = () => {
        console.log('✅ Image loaded successfully');
        editor.chain().focus().setImage({ src: url }).run();
      };
      img.onerror = () => {
        console.error('❌ Failed to load image:', url);
        alert('Không thể tải ảnh từ URL này. Vui lòng kiểm tra lại URL.');
      };
      img.src = url;
    }
  };

  const setLink = () => {
    const url = prompt('Nhập URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden relative">
      {/* Bubble Menu - Hiện khi select text */}
      {showBubbleMenu && (
        <div
          ref={bubbleMenuRef}
          className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-1 flex items-center gap-1 z-50"
          style={{
            top: `${bubbleMenuPosition.top}px`,
            left: `${bubbleMenuPosition.left}px`,
          }}
        >
          <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
          title="Code"
        >
          <Code size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
          title="Add Link"
        >
          <LinkIcon size={16} />
        </button>
        
        {/* Color Picker in Bubble */}
        <div className="relative group">
          <button
            className="p-2 rounded hover:bg-gray-100"
            title="Text Color"
          >
            <Palette size={16} />
          </button>
          <div className="hidden group-hover:block absolute top-full mt-1 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2">
            <div className="grid grid-cols-5 gap-1">
              {textColors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (color.color === '#000000') {
                      editor.chain().focus().unsetColor().run();
                    } else {
                      editor.chain().focus().setColor(color.color).run();
                    }
                  }}
                  className="w-6 h-6 rounded hover:ring-2 hover:ring-blue-500 transition"
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Editor Content with Block Handles */}
      <div className="relative">
        <EditorContent editor={editor} className="prose-handles" />
      </div>

      {/* Image Upload Dropdown */}
      {showImageDropdown && (
        <ImageUploadDropdown
          onInsert={handleImageInsert}
          onClose={() => setShowImageDropdown(false)}
          triggerRef={imageButtonRef}
        />
      )}

      {/* Block Handle Menu */}
      <BlockHandleMenu
        editor={editor}
        show={showBlockMenu}
        position={blockMenuPosition}
        onClose={() => setShowBlockMenu(false)}
      />
    </div>
  );
}
