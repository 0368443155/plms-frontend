'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface IconPickerProps {
  onSelect: (icon: string) => void;
  onClose: () => void;
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

export default function IconPicker({ onSelect, onClose }: IconPickerProps) {
  const [activeCategory, setActiveCategory] = useState('Học tập');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Chọn icon</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 px-4 pt-2 gap-2">
          {Object.keys(ICON_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
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
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-8 gap-2">
            {ICON_CATEGORIES[activeCategory as keyof typeof ICON_CATEGORIES].map((icon, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(icon);
                  onClose();
                }}
                className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded-lg transition-colors"
                title={icon}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Click vào icon để chọn
          </p>
        </div>
      </div>
    </div>
  );
}
