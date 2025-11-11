'use client';

import { useState } from 'react';
import { X, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface ImageUploadModalProps {
  onInsert: (url: string) => void;
  onClose: () => void;
}

export default function ImageUploadModal({ onInsert, onClose }: ImageUploadModalProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const response = await api.post('/notes/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Get full URL
      const uploadedUrl = response.data.url;
      const fullUrl = uploadedUrl.startsWith('http') 
        ? uploadedUrl 
        : `http://localhost:3000${uploadedUrl}`;
      
      onInsert(fullUrl);
      onClose();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(error.response?.data?.message || 'Có lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      alert('Vui lòng nhập URL ảnh');
      return;
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      alert('URL không hợp lệ');
      return;
    }

    onInsert(imageUrl);
    onClose();
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url.trim() && (url.startsWith('http://') || url.startsWith('https://'))) {
      setPreview(url);
    } else {
      setPreview('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Chèn ảnh</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload size={16} className="inline mr-2" />
            Tải ảnh lên
          </button>
          <button
            onClick={() => setMode('url')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              mode === 'url'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LinkIcon size={16} className="inline mr-2" />
            Nhập URL
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'upload' ? (
            <div>
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                      <p className="text-sm text-gray-600">Đang tải lên...</p>
                    </div>
                  ) : preview ? (
                    <div className="space-y-2">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded"
                      />
                      <p className="text-sm text-gray-600">Nhấn để chọn ảnh khác</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="text-gray-400 mb-2" size={32} />
                      <p className="text-sm text-gray-600 mb-1">
                        Nhấn để chọn ảnh hoặc kéo thả vào đây
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF (max 5MB)</p>
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
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL ảnh
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* Preview */}
              {preview && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Xem trước:</p>
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded"
                    onError={() => {
                      setPreview('');
                      alert('Không thể tải ảnh từ URL này');
                    }}
                  />
                </div>
              )}

              <button
                onClick={handleUrlSubmit}
                disabled={!imageUrl.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Chèn ảnh
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-500">
            💡 Mẹo: Ảnh sẽ tự động căn giữa và resize phù hợp với nội dung
          </p>
        </div>
      </div>
    </div>
  );
}
