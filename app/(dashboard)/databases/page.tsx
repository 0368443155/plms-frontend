'use client';

import { useState, useEffect } from 'react';
import { Database as DatabaseIcon, Upload, Trash2, Eye, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

export default function DatabasesPage() {
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewingDatabase, setViewingDatabase] = useState<any>(null);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      const response = await api.get('/databases');
      setDatabases(response.data);
    } catch (error) {
      console.error('Error fetching databases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await api.post('/databases/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Nhập dữ liệu thành công!');
      fetchDatabases();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bảng dữ liệu này?')) {
      return;
    }

    try {
      await api.delete(`/databases/${id}`);
      alert('Xóa bảng dữ liệu thành công!');
      fetchDatabases();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleView = async (id: string) => {
    try {
      const response = await api.get(`/databases/${id}`);
      setViewingDatabase(response.data);
    } catch (error) {
      alert('Có lỗi khi tải dữ liệu');
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bảng dữ liệu</h1>
          <label className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 cursor-pointer transition-colors">
            <Upload size={18} />
            <span>{uploading ? 'Đang tải lên...' : 'Nhập từ file'}</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Hỗ trợ định dạng: Excel (.xlsx, .xls), CSV (.csv) - Tối đa 10MB
        </p>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto text-gray-400" size={32} />
          </div>
        ) : databases.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <DatabaseIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Chưa có bảng dữ liệu nào</p>
            <label className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 cursor-pointer">
              <Upload size={18} />
              <span>Nhập file đầu tiên</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {databases.map((db) => (
              <div key={db.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <DatabaseIcon size={20} className="text-indigo-600" />
                    <h3 className="font-semibold text-gray-900 truncate">{db.name}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {db.columns?.length || 0} cột × {db.rows?.length || 0} hàng
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Nhập lúc: {new Date(db.createdAt).toLocaleDateString('vi-VN')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(db.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    <Eye size={16} />
                    <span className="text-sm">Xem</span>
                  </button>
                  <button
                    onClick={() => handleDelete(db.id)}
                    className="px-3 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewingDatabase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{viewingDatabase.name}</h2>
              <button
                onClick={() => setViewingDatabase(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      {viewingDatabase.columns.map((col: any, idx: number) => (
                        <th
                          key={idx}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        >
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {viewingDatabase.rows.map((row: any[], rowIdx: number) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        {row.map((cell: any, cellIdx: number) => (
                          <td
                            key={cellIdx}
                            className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300"
                          >
                            {cell?.toString() || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
