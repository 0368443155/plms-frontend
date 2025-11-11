'use client';

import { useState } from 'react';
import { Image as ImageIcon, Upload, Link as LinkIcon, X } from 'lucide-react';
import api from '@/lib/axios';
import { getImageUrl } from '@/lib/utils';

interface SimpleImageButtonProps {
  onInsert: (url: string) => void;
}

export default function SimpleImageButton({ onInsert }: SimpleImageButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    
    console.log('📤 File selected:', file.name);

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh tối đa 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!preview) {
      setError('Vui lòng chọn ảnh');
      return;
    }

    // Get file from input
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      console.log('📡 Uploading to /notes/upload-image...');
      
      const response = await api.post('/notes/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('✅ Upload response:', response.data);
      
      const uploadedUrl = response.data.url;
      const fullUrl = getImageUrl(uploadedUrl);
      
      console.log('🖼️ Full Image URL:', fullUrl);
      
      onInsert(fullUrl);
      setShowModal(false);
      setPreview('');
      setImageUrl('');
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('Response:', error.response?.data);
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
      setShowModal(false);
      setPreview('');
      setImageUrl('');
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
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 rounded hover:bg-gray-200"
        title="Chèn ảnh"
        type="button"
      >
        <ImageIcon size={16} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Chèn ảnh</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                  setPreview('');
                  setImageUrl('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setMode('upload')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  mode === 'upload'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <Upload size={16} className="inline mr-2" />
                Tải lên
              </button>
              <button
                onClick={() => setMode('url')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${
                  mode === 'url'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <LinkIcon size={16} className="inline mr-2" />
                URL
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error}
                </div>
              )}

              {mode === 'upload' ? (
                <div className="space-y-4">
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
                      {preview ? (
                        <div>
                          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded mb-2" />
                          <p className="text-sm text-gray-600">Click để chọn ảnh khác</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-600">Click để chọn ảnh</p>
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
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {uploading ? 'Đang tải lên...' : 'Chèn ảnh'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">URL ảnh</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={handleUrlChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {preview && (
                    <div className="border rounded p-4">
                      <p className="text-sm font-medium mb-2">Xem trước:</p>
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded"
                        onError={() => {
                          setPreview('');
                          setError('Không thể tải ảnh từ URL này');
                        }}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleUrlSubmit}
                    disabled={!imageUrl.trim()}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Chèn ảnh
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
