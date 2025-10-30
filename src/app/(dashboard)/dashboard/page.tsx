'use client';

import { useAuthStore } from '@/store/auth.store';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Welcome to PLMS!</h2>
        <p className="text-gray-600">
          Hello, {user?.fullName || user?.email}! 👋
        </p>
        <p className="text-gray-500 mt-2">
          Your workspace is ready. Phase 2 will include page management and editor features.
        </p>
      </div>
    </div>
  );
}