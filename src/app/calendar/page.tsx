"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Users,
  Camera,
  Trash2,
  X,
  Check,
  Tag,
  Radio,
} from "lucide-react";
import { CalendarEvent } from "@/lib/types/director";
import {
  subscribeRealtimeCalendar,
  saveRealtimeCalendarEvent,
  deleteRealtimeCalendarEvent,
  getFirebaseStatus,
} from "@/lib/firebase";

export default function CalendarPage() {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [firebaseConnected, setFirebaseConnected] = React.useState(false);

  // Form State
  const [eventTitle, setEventTitle] = React.useState("");
  const [eventDate, setEventDate] = React.useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [eventTime, setEventTime] = React.useState("09:00 - 11:30");
  const [eventType, setEventType] = React.useState<CalendarEvent["type"]>("workshop");
  const [eventDept, setEventDept] = React.useState<CalendarEvent["department"]>("ALL");
  const [eventDesc, setEventDesc] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = React.useMemo(() => new Date(), []);

  // Lắng nghe Firebase Realtime
  React.useEffect(() => {
    const status = getFirebaseStatus();
    setFirebaseConnected(status.isConfigured);

    setLoading(true);
    const unsubscribe = subscribeRealtimeCalendar((liveEvents) => {
      setEvents(liveEvents);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Tính toán lưới ngày trong tháng (Thứ 2 = 0, CN = 6)
  const calendarDays = React.useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startCol = (firstDay.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Ngày tháng trước
    for (let i = startCol - 1; i >= 0; i--) {
      const prevD = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(
        prevD
      ).padStart(2, "0")}`;
      cells.push({
        day: prevD,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Ngày tháng hiện tại
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isToday =
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Ngày tháng sau bù đủ số ô (35 hoặc 42 ô)
    const totalSlots = cells.length > 35 ? 42 : 35;
    const nextDaysCount = totalSlots - cells.length;
    for (let i = 1; i <= nextDaysCount; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(
        i
      ).padStart(2, "0")}`;
      cells.push({
        day: i,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return cells;
  }, [year, month, today]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;

    setSubmitting(true);
    const newEvent: CalendarEvent = {
      id: "evt_" + Date.now().toString(),
      title: eventTitle.trim(),
      date: eventDate,
      time: eventTime,
      type: eventType,
      department: eventDept,
      description: eventDesc.trim(),
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    try {
      const ok = await saveRealtimeCalendarEvent(newEvent);
      if (ok) {
        setSuccessToast("Đã đồng bộ sự kiện vào lịch thời gian thực!");
        setIsModalOpen(false);
        setEventTitle("");
        setEventDesc("");
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } catch {
      alert("Lỗi khi thêm sự kiện");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Xóa sự kiện "${title}" khỏi lịch?`)) return;
    try {
      await deleteRealtimeCalendarEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Lỗi khi xóa sự kiện");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-blue-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>LỊCH NỘI DUNG &amp; SỰ KIỆN — CLB NHIẾP ẢNH LTD</span>
            {firebaseConnected ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Firebase Realtime
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <Radio className="w-2.5 h-2.5 text-blue-500 animate-pulse" />
                Thời gian thực
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Kế Hoạch Sản Xuất &amp; Sự Kiện
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kế hoạch bài đăng, video TikTok và các buổi workshop/phototrip của 2 ban (Truyền thông &amp; Kỹ thuật).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time Month Switcher */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:text-blue-600 transition-colors"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 min-w-[110px] text-center">
              Tháng {month + 1}, {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:text-blue-600 transition-colors"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sự Kiện Mới</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid & Scheduled Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Month Matrix (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-100 p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 pb-2 border-b border-slate-100">
            <div>Thứ 2</div>
            <div>Thứ 3</div>
            <div>Thứ 4</div>
            <div>Thứ 5</div>
            <div>Thứ 6</div>
            <div>Thứ 7</div>
            <div className="text-blue-600 font-extrabold">Chủ Nhật</div>
          </div>

          {/* Dynamic Days of Month */}
          <div className="grid grid-cols-7 gap-2 min-h-[460px]">
            {calendarDays.map((cell, i) => {
              const dayEvents = events.filter((e) => e.date === cell.dateStr);

              return (
                <div
                  key={i}
                  className={`min-h-[90px] p-2 rounded-2xl border text-xs flex flex-col justify-between transition-colors ${
                    dayEvents.length > 0
                      ? "bg-blue-50/60 border-blue-200"
                      : cell.isCurrentMonth
                      ? "bg-slate-50/50 border-slate-100 hover:border-slate-300"
                      : "bg-slate-50/20 border-slate-100/50 opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                        cell.isToday
                          ? "bg-blue-600 text-white font-extrabold"
                          : ""
                      }`}
                    >
                      {cell.day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>

                  {/* Day Events Pills */}
                  <div className="space-y-1 mt-1">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        title={evt.title}
                        className="p-1 rounded-md bg-blue-600 text-white text-[9px] font-bold truncate shadow-sm"
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scheduled Events List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
              <span>Sự Kiện Trong Lịch ({events.length})</span>
              <span className="text-[10px] text-slate-400">
                Tháng {month + 1}/{year}
              </span>
            </h3>

            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-blue-300 transition-all text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {evt.title}
                      </span>
                      <button
                        onClick={() => handleDeleteEvent(evt.id, evt.title)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Xóa sự kiện"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>
                        {evt.date} • {evt.time}
                      </span>
                    </div>

                    {evt.description && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                        {evt.department === "COMM"
                          ? "Ban Truyền Thông"
                          : evt.department === "TECH"
                          ? "Ban Kỹ Thuật"
                          : "Cả 2 Ban"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Chưa có sự kiện nào trong tháng. Bấm "Thêm Sự Kiện Mới" để lên lịch!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Add New Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <span>Thêm Sự Kiện / Lịch Phát Hành Mới</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  TIÊU ĐỀ SỰ KIỆN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ví dụ: Workshop Chân Dung / Đăng Video TikTok..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    NGÀY DIỄN RA
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    GIỜ DIỄN RA
                  </label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="09:00 - 11:30"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    LOẠI SỰ KIỆN
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="workshop">Workshop đào tạo</option>
                    <option value="phototrip">Phototrip dã ngoại</option>
                    <option value="tiktok_video">Video TikTok / Reels</option>
                    <option value="facebook_post">Bài đăng Facebook</option>
                    <option value="meeting">Họp nội bộ CLB</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    BAN PHỤ TRÁCH
                  </label>
                  <select
                    value={eventDept}
                    onChange={(e) => setEventDept(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">Cả 2 Ban</option>
                    <option value="COMM">Ban Truyền Thông</option>
                    <option value="TECH">Ban Kỹ Thuật</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  MÔ TẢ CHI TIẾT
                </label>
                <textarea
                  rows={2}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Ghi chú địa điểm, diễn giả hoặc kịch bản cần chuẩn bị..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Thêm Lịch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
