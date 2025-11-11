'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface IconPickerDropdownProps {
  onSelect: (icon: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

// Danh sách icons phổ biến cho học tập
const ICON_CATEGORIES = {
  'Học tập': [
    '📚', '📖', '📝', '✏️', '📓', '📔', '📕', '📗', '📘', '📙',
    '📑', '🔖', '📄', '📃', '📋', '📊', '📈', '📉', '🗂️', '📁',
  ],
  'Môn học': [
    '🔢', '➕', '➖', '✖️', '➗', '🧮', '📐', '📏', '🔬', '🧪',
    '🧬', '⚗️', '🔭', '🌍', '🌎', '🌏', '🗺️', '💻', '⌨️', '🖥️',
  ],
  'Hoạt động': [
    '✅', '✔️', '☑️', '✓', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤',
    '🎧', '🎵', '🎶', '🎸', '🎹', '🎺', '🎻', '🥁', '⚽', '🏀',
  ],
  'Biểu tượng': [
    '⭐', '🌟', '✨', '💫', '🔥', '💡', '💪', '👍', '👏', '🙌',
    '🎉', '🎊', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🔔', '⏰',
  ],
  'Cảm xúc': [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  ],
  'Thiên nhiên': [
    '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '💐', '🌿', '🍀', '🌱',
    '🌲', '🌳', '🌴', '🌵', '🌾', '🌈', '☀️', '🌤️', '⛅', '🌥️',
  ],
  'Đồ ăn': [
    '🍎', '🍏', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒',
    '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍆', '🥦', '🥬',
  ],
  'Đồ vật': [
    '📱', '💻', '⌨️', '🖱️', '🖨️', '⏰', '⏱️', '⏲️', '🕰️', '⌚',
    '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🔭', '🔬', '🩺', '💉',
  ],
};

export default function IconPickerDropdown({ onSelect, onClose, triggerRef }: IconPickerDropdownProps) {
  const [activeCategory, setActiveCategory] = useState('Học tập');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate position relative to trigger
    const updatePosition = () => {
      if (triggerRef.current && dropdownRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // Position below button (relative to document, not viewport)
        const top = triggerRect.bottom + scrollTop + 8;
        const left = triggerRect.left + scrollLeft;

        setPosition({ top, left });
      }
    };

    updatePosition();

    // Update on scroll
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    // Click outside to close
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, triggerRef]);

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '400px',
        maxHeight: '500px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Chọn icon</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 px-2 pt-2 gap-1 scrollbar-thin">
        {Object.keys(ICON_CATEGORIES).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeCategory === category
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Icons Grid */}
      <div className="overflow-y-auto p-3" style={{ maxHeight: '300px' }}>
        <div className="grid grid-cols-8 gap-1">
          {ICON_CATEGORIES[activeCategory as keyof typeof ICON_CATEGORIES].map((icon, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(icon);
                onClose();
              }}
              className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded transition-colors"
              title={icon}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 text-center bg-gray-50">
        <p className="text-xs text-gray-500">Click vào icon để chọn</p>
      </div>
    </div>
  );
}
