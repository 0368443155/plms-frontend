'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, FileText, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await api.get(`/notes/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tìm kiếm</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tìm kiếm ghi chú..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
              autoFocus
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Nhấn Enter để tìm kiếm hoặc Esc để xóa
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={32} />
            <p className="text-gray-500">Đang tìm kiếm...</p>
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Tìm thấy <span className="font-semibold">{results.length}</span> kết quả
                {query && (
                  <>
                    {' '}
                    cho "<span className="font-semibold">{query}</span>"
                  </>
                )}
              </p>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Không tìm thấy kết quả nào</p>
                <p className="text-sm text-gray-500 mt-2">
                  Thử tìm kiếm với từ khóa khác
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {note.icon ? (
                        <div className="text-2xl">{note.icon}</div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <FileText size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          {note.title}
                        </h3>
                        {note.subject && (
                          <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mb-2">
                            {note.subject.name}
                          </span>
                        )}
                        <p className="text-sm text-gray-500">
                          Cập nhật lần cuối:{' '}
                          {new Date(note.updatedAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !searched && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Bắt đầu tìm kiếm ghi chú của bạn</p>
            <p className="text-sm text-gray-500">
              Nhập từ khóa vào ô tìm kiếm phía trên
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
