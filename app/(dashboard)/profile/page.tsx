'use client';

import { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';
import api from '@/lib/axios';
import { getAuth, setAuth } from '@/lib/auth';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      setFullName(auth.user.fullName);
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.put('/users/profile', { fullName });
      setSuccess('Cập nhật thông tin thành công!');
      
      const auth = getAuth();
      if (auth) {
        setAuth(auth.token, response.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      setLoading(false);
      return;
    }

    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-4 font-medium ${
                activeTab === 'profile'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={18} />
              <span>Thông tin</span>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-2 px-6 py-4 font-medium ${
                activeTab === 'password'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Lock size={18} />
              <span>Đổi mật khẩu</span>
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {activeTab === 'profile' ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mật khẩu cũ
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmNewPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
