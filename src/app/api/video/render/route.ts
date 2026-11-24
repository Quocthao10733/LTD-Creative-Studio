import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { EditDecisionList, RawClip } from "@/lib/types/video";
import { renderVideoEDL } from "@/lib/video/ffmpeg";

const rendersDir = path.join(process.cwd(), "public", "renders");
const clipsDataFile = path.join(process.cwd(), "data", "video_clips.json");

function ensureRendersDir() {
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureRendersDir();
    const body = await request.json();
    const { edl } = body as { edl: EditDecisionList };

    if (!edl || !edl.shots || edl.shots.length === 0) {
      return NextResponse.json(
        { success: false, error: "Kịch bản EDL không hợp lệ hoặc không có shot nào!" },
        { status: 400 }
      );
    }

    // Load registered clips
    let storedClips: RawClip[] = [];
    if (fs.existsSync(clipsDataFile)) {
      try {
        storedClips = JSON.parse(fs.readFileSync(clipsDataFile, "utf-8"));
      } catch {}
    }

    const clipsMap: Record<string, RawClip> = {};
    for (const clip of storedClips) {
      clipsMap[clip.id] = clip;
    }

    const outputFileName = `ltd_video_${Date.now()}.mp4`;
    const outputPath = path.join(rendersDir, outputFileName);

    console.log(`Starting FFmpeg render for job: ${outputFileName}...`);

    // Execute real FFmpeg video render
    const result = await renderVideoEDL(edl, clipsMap, outputPath);

    // Verify file exists and has size
    if (!fs.existsSync(outputPath) || result.sizeBytes === 0) {
      throw new Error("File MP4 render không tồn tại hoặc có dung lượng 0 byte.");
    }

    const publicUrl = `/renders/${outputFileName}`;

    return NextResponse.json({
      success: true,
      message: "Render video MP4 thành công!",
      data: {
        outputUrl: publicUrl,
        fileName: outputFileName,
        fileSizeBytes: result.sizeBytes,
        aspectRatio: edl.aspectRatio,
        renderedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Lỗi Render Video:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi trong quá trình render video FFmpeg" },
      { status: 500 }
    );
  }
}
