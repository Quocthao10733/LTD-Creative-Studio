import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { IdeaCard } from "@/lib/types/director";

const dataDir = path.join(process.cwd(), "data");
const ideasFilePath = path.join(dataDir, "ideas.json");

function ensureIdeasFile(): IdeaCard[] {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(ideasFilePath)) {
    fs.writeFileSync(ideasFilePath, JSON.stringify([], null, 2), "utf-8");
    return [];
  }
  try {
    const raw = fs.readFileSync(ideasFilePath, "utf-8");
    return JSON.parse(raw) as IdeaCard[];
  } catch {
    return [];
  }
}

function saveIdeas(items: IdeaCard[]) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(ideasFilePath, JSON.stringify(items, null, 2), "utf-8");
}

// GET: Lấy danh sách ý tưởng đã lưu
export async function GET() {
  const items = ensureIdeasFile();
  return NextResponse.json({
    success: true,
    data: items,
    total: items.length,
  });
}

// POST: Lưu ý tưởng mới vào danh sách
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = ensureIdeasFile();

    const newIdea: IdeaCard = {
      id: body.id || Date.now().toString(),
      title: body.title || "Ý tưởng sáng tạo mới",
      bigIdea: body.bigIdea || "",
      format: body.format || "TikTok Short Video (9:16)",
      targetAudience: body.targetAudience || "Cộng đồng yêu nhiếp ảnh",
      shotlist: body.shotlist || "",
      equipment: body.equipment || "",
      timeline: body.timeline || "Trong tháng",
      feasibility: body.feasibility || "Cao",
      createdAt: new Date().toISOString(),
    };

    items.unshift(newIdea);
    saveIdeas(items);

    return NextResponse.json({
      success: true,
      message: "Đã lưu ý tưởng vào kho sáng tạo LTD",
      data: newIdea,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi lưu ý tưởng" },
      { status: 500 }
    );
  }
}

// DELETE: Xóa ý tưởng
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID ý tưởng" }, { status: 400 });
    }

    if (id === "all") {
      saveIdeas([]);
      return NextResponse.json({
        success: true,
        message: "Đã dọn sạch toàn bộ ý tưởng",
      });
    }

    const items = ensureIdeasFile();
    const filtered = items.filter((i) => i.id !== id);
    saveIdeas(filtered);

    return NextResponse.json({
      success: true,
      message: "Đã xóa ý tưởng khỏi danh sách",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xóa ý tưởng" },
      { status: 500 }
    );
  }
}
