"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Clock,
  Radio,
} from "lucide-react";
import { CalendarEvent } from "@/lib/types/director";
import { subscribeRealtimeCalendar, getFirebaseStatus } from "@/lib/firebase";

export function RealtimeCalendarWidget() {
  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date());
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [firebaseConnected, setFirebaseConnected] = React.useState(false);

  // Lắng nghe sự kiện thời gian thực (Firebase Realtime Database hoặc Local sync)
  React.useEffect(() => {
    const status = getFirebaseStatus();
    setFirebaseConnected(status.isConfigured);

    const unsubscribe = subscribeRealtimeCalendar((liveEvents) => {
      setEvents(liveEvents);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Thông tin ngày tháng năm hiện tại
  const today = React.useMemo(() => new Date(), []);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - 11

  // Tính toán số ngày trong tháng và ngày bắt đầu (Thứ 2 = 0, CN = 6)
  const calendarData = React.useMemo(() => {
    const firstDay = new Date(year, month, 1);
    // JS getDay(): 0 = CN, 1 = T2, 2 = T3, ..., 6 = T7
    // Chuyển sang chuẩn T2 = 0, ..., CN = 6
    const startCol = (firstDay.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const prevDays: { day: number; isCurrentMonth: false; isNextMonth: false }[] = [];
    for (let i = startCol - 1; i >= 0; i--) {
      prevDays.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isNextMonth: false,
      });
    }

    const currentDays: { day: number; isCurrentMonth: true; isNextMonth: false }[] = [];
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      currentDays.push({
        day: i,
        isCurrentMonth: true,
        isNextMonth: false,
      });
    }

    const totalRendered = prevDays.length + currentDays.length;
    // Đảm bảo 35 hoặc 42 ô
    const totalSlots = totalRendered > 35 ? 42 : 35;
    const nextDaysCount = totalSlots - totalRendered;
    const nextDays: { day: number; isCurrentMonth: false; isNextMonth: true }[] = [];
    for (let i = 1; i <= nextDaysCount; i++) {
      nextDays.push({
        day: i,
        isCurrentMonth: false,
        isNextMonth: true,
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [year, month]);

  // Điều hướng tháng
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  // Định dạng ngày dạng YYYY-MM-DD
  const formatIsoDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const selectedIso = formatIsoDate(selectedDate);

  // Tìm sự kiện của ngày được chọn
  const dayEvents = events.filter((e) => e.date === selectedIso);

  // Nếu ngày được chọn không có sự kiện, lấy sự kiện gần nhất tiếp theo
  const upcomingEvent = React.useMemo(() => {
    if (dayEvents.length > 0) return dayEvents[0];
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.find((e) => e.date >= selectedIso) || sorted[0] || null;
  }, [events, dayEvents, selectedIso]);

  // Format ngày hiển thị tiếng Việt
  const formatDisplayDate = (isoStr: string) => {
    try {
      const [y, m, d] = isoStr.split("-");
      return `${d}/${m}/${y}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="embers-card rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
      {/* Header Widget */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-xs text-slate-900">Lịch nội dung</h3>
          {firebaseConnected ? (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-600 border border-emerald-200"
              title="Đang đồng bộ Firebase Realtime Database thời gian thực"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-[9px] font-bold text-blue-600"
              title="Thời gian thực hệ thống"
            >
              <Radio className="w-2.5 h-2.5 animate-pulse text-blue-500" />
              Trực tiếp
            </span>
          )}
        </div>
        <Link
          href="/calendar"
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
        >
          <span>Xem lịch đầy đủ</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between px-2 pt-1">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          title="Tháng trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-xs text-slate-800">
          Tháng {month + 1}, {year}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          title="Tháng sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Days Grid: T2 T3 T4 T5 T6 T7 CN */}
      <div className="space-y-1.5 select-none">
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase">
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span>T7</span>
          <span>CN</span>
        </div>

        {/* Dynamic Dates Grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {calendarData.map((slot, idx) => {
            if (!slot.isCurrentMonth) {
              return (
                <span key={idx} className="text-slate-300 py-1 text-[11px]">
                  {slot.day}
                </span>
              );
            }

            const slotIso = `${year}-${String(month + 1).padStart(2, "0")}-${String(
              slot.day
            ).padStart(2, "0")}`;

            const isToday =
              slot.day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            const isSelected =
              slot.day === selectedDate.getDate() &&
              month === selectedDate.getMonth() &&
              year === selectedDate.getFullYear();

            const hasEvent = events.some((e) => e.date === slotIso);

            return (
              <span
                key={idx}
                onClick={() => handleSelectDay(slot.day)}
                className="py-1 cursor-pointer flex flex-col items-center justify-center relative group"
              >
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm scale-105"
                      : isToday
                      ? "border border-blue-500 text-blue-600 bg-blue-50/50"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {slot.day}
                </span>

                {/* Event Dot Indicator */}
                {hasEvent && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-blue-500 absolute bottom-0.5" />
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Highlighted Event Box (Dynamic according to selected day or upcoming) */}
      {upcomingEvent ? (
        <div className="rounded-2xl bg-blue-50/80 border border-blue-100 p-3.5 flex items-center justify-between gap-3 transition-all hover:bg-blue-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 shadow-sm shadow-blue-500/20">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {upcomingEvent.title}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>
                  {upcomingEvent.time}, {formatDisplayDate(upcomingEvent.date)}
                </span>
              </p>
            </div>
          </div>

          <Link
            href="/calendar"
            className="p-1 rounded-lg text-blue-600 hover:bg-blue-100/60 transition-colors shrink-0"
            title="Chi tiết lịch"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Chưa có sự kiện ngày này</span>
          </div>
          <Link
            href="/calendar"
            className="text-[11px] font-bold text-blue-600 hover:underline"
          >
            + Thêm sự kiện
          </Link>
        </div>
      )}
    </div>
  );
}
