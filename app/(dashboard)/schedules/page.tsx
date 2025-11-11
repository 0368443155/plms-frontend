'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '10:00',
    room: '',
    subjectId: '',
  });

  const daysOfWeek = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 7' },
    { value: 0, label: 'Chủ nhật' },
  ];

  useEffect(() => {
    fetchSchedules();
    fetchSubjects();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleOpenModal = (schedule: any = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        room: schedule.room || '',
        subjectId: schedule.subjectId,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '10:00',
        room: '',
        subjectId: subjects[0]?.id || '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.startTime >= formData.endTime) {
      alert('Giờ bắt đầu phải sớm hơn giờ kết thúc');
      return;
    }

    try {
      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule.id}`, formData);
        alert('Cập nhật lịch học thành công!');
      } else {
        await api.post('/schedules', formData);
        alert('Thêm lịch học thành công!');
      }
      fetchSchedules();
      handleCloseModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch học này?')) {
      return;
    }

    try {
      await api.delete(`/schedules/${id}`);
      alert('Xóa lịch học thành công!');
      fetchSchedules();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Group schedules by day
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.dayOfWeek]) {
      acc[schedule.dayOfWeek] = [];
    }
    acc[schedule.dayOfWeek].push(schedule);
    return acc;
  }, {} as Record<number, any[]>);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thời khóa biểu</h1>
          <button
            onClick={() => handleOpenModal()}
            disabled={subjects.length === 0}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Plus size={18} />
            <span>Thêm lịch học</span>
          </button>
        </div>

        {subjects.length === 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Bạn cần tạo môn học trước khi thêm lịch học.{' '}
              <a href="/subjects" className="underline font-semibold">
                Tạo môn học ngay
              </a>
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto text-gray-400" size={32} />
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Chưa có lịch học nào</p>
            {subjects.length > 0 && (
              <button
                onClick={() => handleOpenModal()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Thêm lịch học đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {daysOfWeek.map((day) => (
              <div key={day.value} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-indigo-600 text-white p-3 text-center font-semibold">
                  {day.label}
                </div>
                <div className="p-2 space-y-2 min-h-[200px]">
                  {(groupedSchedules[day.value] || [])
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div
                            className="font-semibold text-sm"
                            style={{ color: schedule.subject?.color || '#3B82F6' }}
                          >
                            {schedule.subject?.name || 'N/A'}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleOpenModal(schedule)}
                              className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(schedule.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                        {schedule.room && (
                          <p className="text-xs text-gray-500">Phòng: {schedule.room}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSchedule ? 'Chỉnh sửa lịch học' : 'Thêm lịch học mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Môn học *</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thứ *</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {daysOfWeek.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ bắt đầu *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ kết thúc *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng (tùy chọn)
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ví dụ: A101"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {editingSchedule ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
