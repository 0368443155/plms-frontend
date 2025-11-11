'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import api from '@/lib/axios';

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ghi chú của tôi</h1>
          <Link href="/notes/new">
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              <Plus size={18} />
              <span>Tạo mới</span>
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Chưa có ghi chú nào</p>
            <Link href="/notes/new">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                Tạo ghi chú đầu tiên
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                {note.icon && (
                  <div className="text-2xl mb-2">{note.icon}</div>
                )}
                <h3 className="font-semibold text-gray-900 mb-2 truncate">
                  {note.title}
                </h3>
                {note.subject && (
                  <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {note.subject.name}
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(note.updatedAt).toLocaleDateString('vi-VN')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
