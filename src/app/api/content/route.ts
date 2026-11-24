import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ContentItem } from "@/lib/types/content";

const dataDir = path.join(process.cwd(), "data");
const contentFilePath = path.join(dataDir, "content.json");

function ensureContentFile(): ContentItem[] {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(contentFilePath)) {
    fs.writeFileSync(contentFilePath, JSON.stringify([], null, 2), "utf-8");
    return [];
  }
  try {
    const raw = fs.readFileSync(contentFilePath, "utf-8");
    return JSON.parse(raw) as ContentItem[];
  } catch {
    return [];
  }
}

function saveContent(items: ContentItem[]) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(contentFilePath, JSON.stringify(items, null, 2), "utf-8");
}

// GET: Lấy danh sách bài viết đã lưu trong thư viện
export async function GET(request: NextRequest) {
  const items = ensureContentFile();
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get("platform");
  const q = searchParams.get("q")?.toLowerCase();

  let filtered = items;
  if (platform && platform !== "all") {
    filtered = filtered.filter((i) => i.platform === platform);
  }
  if (q) {
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.hook.toLowerCase().includes(q) ||
        i.body.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
}

// POST: Lưu bài viết mới vào thư viện
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = ensureContentFile();

    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: body.title || body.hook?.slice(0, 50) || "Bài viết LTD mới",
      platform: body.platform || "facebook",
      postType: body.postType || "general",
      tone: body.tone || "artistic",
      hook: body.hook || "",
      body: body.body || "",
      hashtags: Array.isArray(body.hashtags) ? body.hashtags : [],
      visualTips: body.visualTips || "",
      factsChecklist: Array.isArray(body.factsChecklist) ? body.factsChecklist : [],
      status: "draft",
      author: body.author || "Ban Truyền Thông LTD",
      department: "COMM",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    saveContent(items);

    return NextResponse.json({
      success: true,
      message: "Đã lưu bài viết vào Thư Viện CLB LTD",
      data: newItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi lưu bài viết" },
      { status: 500 }
    );
  }
}

// DELETE: Xóa bài viết khỏi thư viện
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID bài viết" }, { status: 400 });
    }

    const items = ensureContentFile();
    const filtered = items.filter((i) => i.id !== id);
    saveContent(filtered);

    return NextResponse.json({
      success: true,
      message: "Đã xóa bài viết khỏi thư viện",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xóa bài viết" },
      { status: 500 }
    );
  }
}
