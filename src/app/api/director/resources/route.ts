import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ResourceItem } from "@/lib/ai/knowledge/director/org-knowledge";

const DATA_DIR = path.join(process.cwd(), "data");
const RESOURCES_FILE = path.join(DATA_DIR, "resource_inventory.json");

let memoryResources: ResourceItem[] | null = null;

function readResources(): ResourceItem[] {
  if (memoryResources) return memoryResources;
  try {
    if (fs.existsSync(RESOURCES_FILE)) {
      const raw = fs.readFileSync(RESOURCES_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryResources = parsed;
        return parsed;
      }
    }
  } catch {}
  memoryResources = [];
  return memoryResources;
}

function saveResources(items: ResourceItem[]) {
  memoryResources = items;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(RESOURCES_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch {}
}

export async function GET() {
  const items = readResources();
  return NextResponse.json({ success: true, data: items, total: items.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, status, notes } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: "Tên nguồn lực là bắt buộc." }, { status: 400 });
    }

    const items = readResources();
    const newItem: ResourceItem = {
      id: `RES-${Date.now()}`,
      name: name.trim(),
      category: category || "camera",
      status: status || "Needs confirmation",
      notes: notes ? String(notes).trim() : "",
    };

    const updated = [newItem, ...items];
    saveResources(updated);

    return NextResponse.json({ success: true, data: newItem });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Lỗi thêm nguồn lực" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID nguồn lực" }, { status: 400 });
    }
    const items = readResources().filter((r) => r.id !== id);
    saveResources(items);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Lỗi xóa nguồn lực" },
      { status: 500 }
    );
  }
}
