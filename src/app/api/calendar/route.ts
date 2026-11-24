import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CalendarEvent } from "@/lib/types/director";

const dataDir = path.join(process.cwd(), "data");
const calendarFilePath = path.join(dataDir, "calendar.json");

function ensureCalendarFile(): CalendarEvent[] {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(calendarFilePath)) {
    // Seed initial default club events for November 2026
    const initialEvents: CalendarEvent[] = [
      {
        id: "evt_1",
        title: "Workshop Nhiếp Ảnh Cơ Bản",
        date: "2026-11-15",
        time: "09:00 - 11:00",
        type: "workshop",
        department: "ALL",
        description: "Buổi chia sẻ về kỹ thuật làm chủ tam giác phơi sáng và bố cục 1/3 cho thành viên mới.",
        status: "scheduled",
        createdAt: new Date().toISOString(),
      },
      {
        id: "evt_2",
        title: "Phát hành Video TikTok Tips #1",
        date: "2026-11-20",
        time: "19:00",
        type: "tiktok_video",
        department: "COMM",
        description: "Video ngắn 30s hướng dẫn chụp chân dung với ánh sáng tự nhiên.",
        status: "scheduled",
        createdAt: new Date().toISOString(),
      },
      {
        id: "evt_3",
        title: "Phototrip Săn Hoàng Hôn Hồ Trị An",
        date: "2026-11-28",
        time: "14:30 - 18:30",
        type: "phototrip",
        department: "TECH",
        description: "Dã ngoại sáng tác ảnh phong cảnh và test ống kính góc rộng cùng Ban Kỹ Thuật.",
        status: "scheduled",
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(calendarFilePath, JSON.stringify(initialEvents, null, 2), "utf-8");
    return initialEvents;
  }
  try {
    const raw = fs.readFileSync(calendarFilePath, "utf-8");
    return JSON.parse(raw) as CalendarEvent[];
  } catch {
    return [];
  }
}

function saveCalendar(events: CalendarEvent[]) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(calendarFilePath, JSON.stringify(events, null, 2), "utf-8");
}

// GET: Lấy danh sách sự kiện lịch
export async function GET(request: NextRequest) {
  const events = ensureCalendarFile();
  const searchParams = request.nextUrl.searchParams;
  const month = searchParams.get("month"); // e.g., "2026-11"

  let filtered = events;
  if (month) {
    filtered = filtered.filter((e) => e.date.startsWith(month));
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
}

// POST: Thêm sự kiện lịch mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events = ensureCalendarFile();

    if (!body.title || !body.date) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề và ngày diễn ra là bắt buộc" },
        { status: 400 }
      );
    }

    const newEvent: CalendarEvent = {
      id: body.id || Date.now().toString(),
      title: body.title.trim(),
      date: body.date.trim(),
      time: body.time?.trim() || "09:00",
      type: body.type || "workshop",
      department: body.department || "ALL",
      description: body.description?.trim() || "",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    events.unshift(newEvent);
    saveCalendar(events);

    return NextResponse.json({
      success: true,
      message: "Đã thêm sự kiện vào lịch thành công",
      data: newEvent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi lưu lịch" },
      { status: 500 }
    );
  }
}

// DELETE: Xóa sự kiện
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID sự kiện" }, { status: 400 });
    }

    const events = ensureCalendarFile();
    const filtered = events.filter((e) => e.id !== id);
    saveCalendar(filtered);

    return NextResponse.json({
      success: true,
      message: "Đã xóa sự kiện khỏi lịch",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xóa sự kiện" },
      { status: 500 }
    );
  }
}
