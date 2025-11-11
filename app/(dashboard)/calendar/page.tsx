'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      const response = await api.get('/calendar/all-events');
      setSchedules(response.data.schedules || []);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return { schedules: [], events: [] };

    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    // Get schedules for this day of week
    const daySchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);

    // Get events for this specific date
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.dueDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });

    return { schedules: daySchedules, events: dayEvents };
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={today}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hôm nay
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {dayNames.map((day, idx) => (
              <div
                key={idx}
                className={`py-3 text-center text-sm font-semibold ${
                  idx === 0 ? 'text-red-600' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {days.map((date, idx) => {
              const { schedules: daySchedules, events: dayEvents } = getEventsForDate(date);
              const hasEvents = daySchedules.length > 0 || dayEvents.length > 0;

              return (
                <div
                  key={idx}
                  className={`min-h-[120px] border-b border-r border-gray-200 p-2 ${
                    !date ? 'bg-gray-50' : isToday(date) ? 'bg-blue-50' : 'bg-white'
                  } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                >
                  {date && (
                    <>
                      <div
                        className={`text-sm font-semibold mb-1 ${
                          isToday(date)
                            ? 'text-blue-600'
                            : date.getDay() === 0
                            ? 'text-red-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {date.getDate()}
                      </div>

                      {/* Schedules */}
                      {daySchedules.slice(0, 2).map((schedule, i) => (
                        <div
                          key={`schedule-${i}`}
                          className="text-xs p-1 mb-1 rounded truncate"
                          style={{
                            backgroundColor: schedule.color || '#3B82F6',
                            color: 'white',
                          }}
                          title={`${schedule.title} (${schedule.startTime}-${schedule.endTime})`}
                        >
                          {schedule.startTime} {schedule.title}
                        </div>
                      ))}

                      {/* Events */}
                      {dayEvents.slice(0, 2).map((event, i) => (
                        <div
                          key={`event-${i}`}
                          className="text-xs p-1 mb-1 rounded truncate"
                          style={{
                            backgroundColor: event.completed ? '#10B981' : '#EF4444',
                            color: 'white',
                          }}
                          title={`${event.title} ${event.completed ? '(Hoàn thành)' : ''}`}
                        >
                          {event.title}
                        </div>
                      ))}

                      {/* Show more indicator */}
                      {daySchedules.length + dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{daySchedules.length + dayEvents.length - 2} sự kiện
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Chú thích:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Lịch học (lặp lại hàng tuần)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Deadline/Sự kiện chưa hoàn thành</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Deadline/Sự kiện đã hoàn thành</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
