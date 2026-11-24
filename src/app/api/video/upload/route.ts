import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { RawClip } from "@/lib/types/video";
import { getVideoMetadata, extractThumbnail } from "@/lib/video/ffmpeg";

const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
const thumbDir = path.join(process.cwd(), "public", "uploads", "thumbnails");
const clipsDataFile = path.join(process.cwd(), "data", "video_clips.json");

function ensureDirs() {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
  const dataDir = path.dirname(clipsDataFile);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(clipsDataFile)) fs.writeFileSync(clipsDataFile, JSON.stringify([], null, 2));
}

function getStoredClips(): RawClip[] {
  ensureDirs();
  try {
    return JSON.parse(fs.readFileSync(clipsDataFile, "utf-8")) as RawClip[];
  } catch {
    return [];
  }
}

function saveStoredClips(clips: RawClip[]) {
  ensureDirs();
  fs.writeFileSync(clipsDataFile, JSON.stringify(clips, null, 2), "utf-8");
}

// GET: Lấy danh sách video clips đã upload
export async function GET() {
  const clips = getStoredClips();
  return NextResponse.json({ success: true, data: clips });
}

// POST: Upload video file
export async function POST(request: NextRequest) {
  try {
    ensureDirs();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Vui lòng chọn file video" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${Date.now()}_${sanitizedName}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    // Metadata via ffprobe
    const metadata = await getVideoMetadata(filePath);

    // Thumbnail via ffmpeg
    const thumbName = `${uniqueFileName}.jpg`;
    const thumbPath = path.join(thumbDir, thumbName);
    try {
      await extractThumbnail(filePath, thumbPath, 1.0);
    } catch (tErr) {
      console.warn("Không thể trích xuất thumbnail:", tErr);
    }

    const newClip: RawClip = {
      id: Date.now().toString(),
      name: file.name,
      path: filePath,
      url: `/uploads/videos/${uniqueFileName}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbName}`,
      duration: metadata.duration || 10,
      width: metadata.width || 1080,
      height: metadata.height || 1920,
      fps: metadata.fps || 30,
      sizeBytes: buffer.length,
    };

    const currentClips = getStoredClips();
    currentClips.unshift(newClip);
    saveStoredClips(currentClips);

    return NextResponse.json({
      success: true,
      message: "Upload video clip thành công",
      data: newClip,
    });
  } catch (error: any) {
    console.error("Lỗi upload video:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xử lý upload video" },
      { status: 500 }
    );
  }
}
