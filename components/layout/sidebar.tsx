'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Trash2,
  Calendar,
  Bell,
  User,
  LogOut,
  Plus,
  Database,
} from 'lucide-react';
import { clearAuth, getAuth } from '@/lib/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      setUser(auth.user);
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      clearAuth();
      router.push('/login');
    }
  };

  const menuItems = [
    { icon: FileText, label: 'Ghi chú', href: '/notes' },
    { icon: Search, label: 'Tìm kiếm', href: '/search' },
    { icon: Trash2, label: 'Thùng rác', href: '/trash' },
    { icon: Calendar, label: 'Lịch', href: '/calendar' },
    { icon: Database, label: 'Bảng dữ liệu', href: '/databases' },
    { icon: Bell, label: 'Thông báo', href: '/notifications' },
    { icon: User, label: 'Hồ sơ', href: '/profile' },
  ];

  return (
    <div className="w-64 bg-gray-50 min-h-screen border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">PLMS</h1>
        {user && (
          <p className="text-sm text-gray-600 mt-1">{user.fullName}</p>
        )}
      </div>

      <div className="p-4">
        <Link href="/notes/new">
          <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            <Plus size={16} />
            <span>Tạo ghi chú mới</span>
          </button>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
