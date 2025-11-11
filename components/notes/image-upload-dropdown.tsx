'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, X } from 'lucide-react';
import api from '@/lib/axios';
import { getImageUrl } from '@/lib/utils';

interface ImageUploadDropdownProps {
  onInsert: (url: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

export default function ImageUploadDropdown({ onInsert, onClose, triggerRef }: ImageUploadDropdownProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    // Update on scroll and resize
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    console.log('📤 File selected:', file.name, file.type, file.size);

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh tối đa 5MB');
      return;
    }

    // Store file reference
    setSelectedFile(file);
    console.log('✅ File stored in state');

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      console.log('✅ Preview generated');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    console.log('🚀 handleUploadSubmit called');
    console.log('Preview:', preview);
    console.log('Selected file from state:', selectedFile);
    
    if (!preview || !selectedFile) {
      setError('Vui lòng chọn ảnh');
      return;
    }

    const file = selectedFile;

    console.log('📦 File info:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const formData = new FormData();
    formData.append('image', file);

    console.log('📤 FormData created');

    try {
      setUploading(true);
      console.log('📡 Uploading to /notes/upload-image...');
      console.log('API base URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await api.post('/notes/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('✅ Upload response:', response.data);
      
      const uploadedUrl = response.data.url;
      const fullUrl = getImageUrl(uploadedUrl);
      
      console.log('🖼️ Full Image URL:', fullUrl);
      
      onInsert(fullUrl);
      onClose();
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(error.response?.data?.message || 'Có lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      setError('Vui lòng nhập URL ảnh');
      return;
    }

    try {
      new URL(imageUrl);
      onInsert(imageUrl);
      onClose();
    } catch {
      setError('URL không hợp lệ');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setError('');
    if (url.trim() && (url.startsWith('http://') || url.startsWith('https://'))) {
      setPreview(url);
    } else {
      setPreview('');
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '380px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Chèn ảnh</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 py-2 px-3 text-xs font-medium ${
            mode === 'upload'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload size={14} className="inline mr-1" />
          Tải lên
        </button>
        <button
          onClick={() => setMode('url')}
          className={`flex-1 py-2 px-3 text-xs font-medium ${
            mode === 'url'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LinkIcon size={14} className="inline mr-1" />
          URL
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
            {error}
          </div>
        )}

        {mode === 'upload' ? (
          <div className="space-y-2">
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-blue-400 transition">
                {preview ? (
                  <div>
                    <div className="w-full h-32 flex items-center justify-center overflow-hidden rounded mb-1 bg-gray-50">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-600">Click để chọn ảnh khác</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto text-gray-400 mb-1" size={24} />
                    <p className="text-xs text-gray-600">Click để chọn ảnh</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 5MB)</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>

            {preview && (
              <button
                onClick={handleUploadSubmit}
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
              >
                {uploading ? 'Đang tải lên...' : 'Chèn ảnh'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="url"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-2 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {preview && (
              <div className="border rounded p-2 bg-gray-50">
                <div className="w-full h-32 flex items-center justify-center overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded"
                    onError={() => {
                      setPreview('');
                      setError('Không thể tải ảnh từ URL này');
                    }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleUrlSubmit}
              disabled={!imageUrl.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-300"
            >
              Chèn ảnh
            </button>
          </div>
        )}
      </div>

      {/* Footer tip */}
      <div className="px-3 pb-2">
        <p className="text-xs text-gray-500">💡 Ảnh sẽ tự động căn giữa</p>
      </div>
    </div>
  );
}
