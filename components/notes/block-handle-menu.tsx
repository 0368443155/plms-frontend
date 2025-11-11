'use client';

import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/core';
import {
  GripVertical,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Palette,
  Trash2,
} from 'lucide-react';

interface BlockHandleMenuProps {
  editor: Editor;
  show: boolean;
  position: { top: number; left: number };
  onClose: () => void;
}

const blockTypes = [
  { label: 'Text', icon: Type, command: 'setParagraph' },
  { label: 'Heading 1', icon: Heading1, command: 'setHeading', level: 1 },
  { label: 'Heading 2', icon: Heading2, command: 'setHeading', level: 2 },
  { label: 'Heading 3', icon: Heading3, command: 'setHeading', level: 3 },
  { label: 'Bullet List', icon: List, command: 'toggleBulletList' },
  { label: 'Numbered List', icon: ListOrdered, command: 'toggleOrderedList' },
  { label: 'To-do List', icon: CheckSquare, command: 'toggleTaskList' },
  { label: 'Quote', icon: Quote, command: 'setBlockquote' },
  { label: 'Code', icon: Code, command: 'setCodeBlock' },
];

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

export default function BlockHandleMenu({ editor, show, position, onClose }: BlockHandleMenuProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  const handleBlockTypeChange = (type: any) => {
    if (type.command === 'setHeading') {
      editor.chain().focus().setHeading({ level: type.level }).run();
    } else if (type.command === 'setParagraph') {
      editor.chain().focus().setParagraph().run();
    } else if (type.command === 'setBlockquote') {
      editor.chain().focus().setBlockquote().run();
    } else if (type.command === 'setCodeBlock') {
      editor.chain().focus().setCodeBlock().run();
    } else if (type.command === 'toggleBulletList') {
      editor.chain().focus().toggleBulletList().run();
    } else if (type.command === 'toggleOrderedList') {
      editor.chain().focus().toggleOrderedList().run();
    } else if (type.command === 'toggleTaskList') {
      editor.chain().focus().toggleTaskList().run();
    }
    onClose();
  };

  const handleColorChange = (color: string) => {
    if (color === '#000000') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
    setShowColorPicker(false);
    onClose();
  };

  const handleDelete = () => {
    editor.chain().focus().deleteNode('paragraph').run();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[200px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* Chuyển thành */}
      <div className="p-2 border-b border-gray-200">
        <div className="text-xs font-semibold text-gray-500 px-2 mb-1">Chuyển thành</div>
        <div className="space-y-0.5">
          {blockTypes.map((type, idx) => (
            <button
              key={idx}
              onClick={() => handleBlockTypeChange(type)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-gray-100 rounded text-sm"
            >
              <type.icon size={16} className="text-gray-600" />
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Màu chữ */}
      <div className="p-2">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-gray-100 rounded text-sm"
        >
          <Palette size={16} className="text-gray-600" />
          <span>Màu chữ</span>
        </button>

        {showColorPicker && (
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <div className="grid grid-cols-5 gap-1">
              {textColors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => handleColorChange(color.color)}
                  className="w-8 h-8 rounded hover:ring-2 hover:ring-blue-500 transition"
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleDelete}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-left hover:bg-red-50 rounded text-sm text-red-600 mt-1"
        >
          <Trash2 size={16} />
          <span>Xóa</span>
        </button>
      </div>
    </div>
  );
}
