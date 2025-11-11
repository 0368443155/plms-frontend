'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Smile,
  Image as ImageIcon,
  Trash2,
  ArrowLeft,
  Loader2,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';
import NotionEditor from '@/components/notes/notion-editor';
import { getImageUrl } from '@/lib/utils';

// Dynamic import for dropdowns
const IconPickerDropdown = dynamic(() => import('@/components/notes/icon-picker-dropdown'), { ssr: false });

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [icon, setIcon] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showAI, setShowAI] = useState(false);
  
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState('');

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  const fetchNote = async () => {
    try {
      const response = await api.get(`/notes/${noteId}`);
      const data = response.data;
      setNote(data);
      setTitle(data.title);
      setContent(data.content || '');
      setIcon(data.icon || '');
      setCoverImage(data.coverImage || '');
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        alert('Ghi chú không tồn tại hoặc bạn không có quyền truy cập');
        router.push('/notes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(
    async (field: string, value: string) => {
      setSaving(true);
      try {
        await api.put(`/notes/${noteId}`, { [field]: value });
      } catch (error) {
        console.error('Error saving:', error);
      } finally {
        setSaving(false);
      }
    },
    [noteId]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
  };

  const handleTitleBlur = () => {
    if (title !== note?.title) {
      handleSave('title', title);
    }
  };

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      // Auto-save after 1 second of inactivity
      const timeoutId = setTimeout(() => {
        handleSave('content', newContent);
      }, 1000);
      return () => clearTimeout(timeoutId);
    },
    [handleSave]
  );

  const handleIconSelect = async (selectedIcon: string) => {
    setIcon(selectedIcon);
    await handleSave('icon', selectedIcon);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('cover', file);

    try {
      setSaving(true);
      const response = await api.post(`/notes/${noteId}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCoverImage(response.data.note.coverImage);
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert('Có lỗi khi tải ảnh bìa');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn chuyển ghi chú này vào thùng rác?')) {
      return;
    }

    try {
      await api.delete(`/notes/${noteId}`);
      alert('Đã chuyển ghi chú vào thùng rác');
      router.push('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Có lỗi khi xóa ghi chú');
    }
  };

  const handleSummarize = async () => {
    setAiLoading(true);
    setAiAnswer('');
    try {
      const response = await api.post(`/ai/summarize/${noteId}`);
      setAiAnswer(response.data.summary);
      setShowAI(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi khi tóm tắt');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    try {
      const response = await api.post(`/ai/ask/${noteId}`, {
        question: aiQuestion,
      });
      setAiAnswer(response.data.answer);
      setAiQuestion('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi khi hỏi đáp');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => router.push('/notes')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Đang lưu...
            </span>
          )}
          <button
            onClick={handleSummarize}
            disabled={aiLoading}
            className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>Tóm tắt AI</span>
          </button>
          <button
            onClick={() => setShowAI(true)}
            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <MessageSquare size={16} />
            <span>Hỏi đáp AI</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={16} />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {/* Cover Image */}
      {coverImage ? (
        <div className="relative group">
          <img 
            src={getImageUrl(coverImage)} 
            alt="Cover" 
            className="w-full h-60 object-cover" 
          />
          <label className="absolute bottom-4 right-4 cursor-pointer bg-white px-3 py-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <ImageIcon size={16} className="inline mr-2" />
            Đổi ảnh bìa
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </label>
        </div>
      ) : (
        <label className="block w-full h-40 bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center justify-center border-b border-gray-200 transition-colors">
          <div className="text-center text-gray-500">
            <ImageIcon size={32} className="mx-auto mb-2" />
            <span>Thêm ảnh bìa</span>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        </label>
      )}

      <div className="p-8">
        {/* Icon and Title */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {icon ? (
              <button
                ref={iconButtonRef}
                onClick={() => setShowIconPicker(true)}
                className="text-6xl hover:opacity-80 transition-opacity"
                title="Đổi icon"
              >
                {icon}
              </button>
            ) : (
              <button
                ref={iconButtonRef}
                onClick={() => setShowIconPicker(true)}
                className="w-16 h-16 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Thêm icon"
              >
                <Smile size={32} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Icon Picker Dropdown */}
          {showIconPicker && (
            <IconPickerDropdown
              onSelect={handleIconSelect}
              onClose={() => setShowIconPicker(false)}
              triggerRef={iconButtonRef}
            />
          )}

          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            placeholder="Tiêu đề chưa có tên"
            className="w-full text-4xl font-bold border-none outline-none focus:ring-0"
          />
        </div>

        {/* Editor */}
        <NotionEditor content={content} onChange={handleContentChange} />
      </div>

      {/* AI Modal */}
      {showAI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">AI Trợ lý</h3>
              <button
                onClick={() => {
                  setShowAI(false);
                  setAiAnswer('');
                  setAiQuestion('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {aiAnswer && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">Trả lời:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{aiAnswer}</p>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                placeholder="Đặt câu hỏi về tài liệu..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAskQuestion}
                disabled={aiLoading || !aiQuestion.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="animate-spin" size={20} /> : 'Hỏi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
