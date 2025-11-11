'use client';

import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';
import api from '@/lib/axios';

export default function TrashPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    try {
      const response = await api.get('/notes/trash');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching trash:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await api.post(`/notes/${id}/restore`);
      alert('Khôi phục ghi chú thành công!');
      fetchTrash();
    } catch (error) {
      console.error('Error restoring note:', error);
      alert('Có lỗi xảy ra khi khôi phục ghi chú');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (
      !confirm(
        'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa vĩnh viễn ghi chú này?'
      )
    ) {
      return;
    }

    try {
      await api.delete(`/notes/${id}/permanent`);
      alert('Đã xóa vĩnh viễn ghi chú.');
      fetchTrash();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Có lỗi xảy ra khi xóa ghi chú');
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thùng rác</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Trash2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Thùng rác trống</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{note.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Đã xóa vào{' '}
                    {new Date(note.deletedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestore(note.id)}
                    className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Khôi phục"
                  >
                    <RotateCcw size={16} />
                    <span className="text-sm">Khôi phục</span>
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(note.id)}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Xóa vĩnh viễn"
                  >
                    <X size={16} />
                    <span className="text-sm">Xóa vĩnh viễn</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
