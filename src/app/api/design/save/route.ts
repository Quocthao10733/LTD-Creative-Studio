import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PosterProject } from "@/lib/types/design";

const dataDir = path.join(process.cwd(), "data");
const postersFilePath = path.join(dataDir, "posters.json");
const contentFilePath = path.join(dataDir, "content.json");
const calendarFilePath = path.join(dataDir, "calendar.json");

function ensurePostersFile(): PosterProject[] {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(postersFilePath)) {
    fs.writeFileSync(postersFilePath, "[]", "utf-8");
    return [];
  }
  try {
    const raw = fs.readFileSync(postersFilePath, "utf-8");
    return JSON.parse(raw) as PosterProject[];
  } catch {
    return [];
  }
}

export async function GET() {
  const posters = ensurePostersFile();
  return NextResponse.json({ success: true, data: posters });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const posters = ensurePostersFile();

    const newPoster: PosterProject = {
      id: body.id || `poster-${Date.now()}`,
      title: body.title || "Poster Sự Kiện LTD",
      presetId: body.presetId || "fb-square",
      width: body.width || 1080,
      height: body.height || 1080,
      backgroundColor: body.backgroundColor || "#0B132B",
      backgroundImage: body.backgroundImage,
      layers: body.layers || [],
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: body.tags || ["poster", "ltd-design"],
    };

    const existingIndex = posters.findIndex((p) => p.id === newPoster.id);
    if (existingIndex >= 0) {
      posters[existingIndex] = newPoster;
    } else {
      posters.unshift(newPoster);
    }

    fs.writeFileSync(postersFilePath, JSON.stringify(posters, null, 2), "utf-8");

    // Đồng bộ đồng thời vào Thư viện LTD (content.json) để thành viên truy cập dễ dàng
    try {
      if (fs.existsSync(contentFilePath)) {
        const rawContent = fs.readFileSync(contentFilePath, "utf-8");
        const contents = JSON.parse(rawContent);
        if (Array.isArray(contents)) {
          const libraryEntry = {
            id: `lib-${newPoster.id}`,
            platform: body.canvaUrl ? "Canva Pro & Facebook/TikTok" : "Facebook & TikTok Poster",
            topic: newPoster.title,
            hook: `[Bản thiết kế Poster & Banner] ${newPoster.title}`,
            body: body.canvaUrl
              ? `Thiết kế chính thức trên Canva Studio. Link mở dự án: ${body.canvaUrl}\nẢnh thành phẩm lưu trữ tại Thư viện LTD.`
              : `Đã thiết kế chuẩn kích thước ${newPoster.width}x${newPoster.height} (${newPoster.presetId}). Bản thiết kế bao gồm ${newPoster.layers.length} layers chỉnh sửa trực tiếp.`,
            hashtags: ["#LTDPhotoClub", "#LongThanhDigital", "#PosterDesign", "#CanvaLTD"],
            visualTips: body.canvaUrl
              ? `Mở trực tiếp trên Canva để chỉnh sửa: ${body.canvaUrl}`
              : "Tải file PNG chất lượng cao từ AI Design Studio hoặc mở chỉnh sửa lại.",
            createdAt: newPoster.updatedAt,
            author: body.author || "Ban Truyền thông (Canva Studio)",
            status: "Đã duyệt thiết kế",
            canvaUrl: body.canvaUrl,
            previewImage: body.backgroundImage || body.previewImage,
          };
          contents.unshift(libraryEntry);
          fs.writeFileSync(contentFilePath, JSON.stringify(contents, null, 2), "utf-8");
        }
      }
    } catch (libErr) {
      console.warn("Lỗi sync vào content.json:", libErr);
    }

    // Nếu người dùng chọn ngày xếp lịch, đồng bộ thẳng vào data/calendar.json
    if (body.scheduleDate) {
      try {
        if (fs.existsSync(calendarFilePath)) {
          const rawCalendar = fs.readFileSync(calendarFilePath, "utf-8");
          const calendarEvents = JSON.parse(rawCalendar);
          if (Array.isArray(calendarEvents)) {
            const calendarEntry = {
              id: `evt-${Date.now()}`,
              title: `[Đăng Poster Canva] ${newPoster.title}`,
              date: body.scheduleDate,
              time: body.scheduleTime || "09:00",
              type: "post",
              department: body.department || "COMM",
              status: "scheduled",
              description: `Phát hành ấn phẩm poster sự kiện thiết kế từ Canva Studio. ${body.canvaUrl ? `Link Canva: ${body.canvaUrl}` : ""}`,
              createdAt: newPoster.updatedAt,
            };
            calendarEvents.unshift(calendarEntry);
            fs.writeFileSync(calendarFilePath, JSON.stringify(calendarEvents, null, 2), "utf-8");
          }
        }
      } catch (calErr) {
        console.warn("Lỗi sync vào calendar.json:", calErr);
      }
    }

    return NextResponse.json({ success: true, data: newPoster });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi lưu bản thiết kế poster" },
      { status: 500 }
    );
  }
}
