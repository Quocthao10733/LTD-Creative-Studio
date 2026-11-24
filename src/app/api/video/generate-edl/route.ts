import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, LTD_KNOWLEDGE_BASE, LTD_EXPERT_SKILLS_PROMPT } from "@/lib/ai/gemini";
import { EditDecisionList, EDLShot, RawClip } from "@/lib/types/video";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clips, prompt, aspectRatio, targetDuration, model } = body;

    const clipList: RawClip[] = clips || [];
    const ratio = aspectRatio || "9:16";
    const duration = targetDuration || 15;

    const ai = getGeminiClient();
    const selectedModel =
      model === "gemini-2.5-flash" || !model ? "gemini-3.5-flash-lite" : model;

    const systemPrompt = `
Bạn là Đạo diễn Hậu kỳ Video (Lead Video Editor & Director) của CLB Nhiếp ảnh LTD, vận dụng phương pháp dựng phim và viral video từ 53 kỹ năng Marketing & Video hàng đầu.

${LTD_KNOWLEDGE_BASE}

${LTD_EXPERT_SKILLS_PROMPT}

QUY TẮC DỰNG VIDEO SHORT 9:16:
1. [0-3s]: Hook thị giác cực mạnh kèm âm thanh đánh động, giữ chân người xem không lướt qua.
2. [Thân video]: Nhịp cắt nhanh (2-3 giây/cảnh), đan xen giữa B-roll cận cảnh thao tác máy ảnh, nụ cười thanh xuân và phong cảnh bến sông Long Thành.
3. [Subtitles]: Câu chữ súc tích, nhịp điệu ngắn, font hiển thị rõ ràng.
4. [Outro]: Kêu gọi tương tác tự nhiên.

ĐỊNH DẠNG ĐẦU RA (JSON FORMAT DUY NHẤT):
Trả về DUY NHẤT một đối tượng JSON hợp lệ (không kèm markdown \`\`\`json) với cấu trúc:
{
  "title": "Tiêu đề video recap",
  "aspectRatio": "${ratio}",
  "targetDuration": ${duration},
  "shots": [
    {
      "id": "shot_1",
      "clipId": "ID của clip nguồn",
      "clipName": "Tên clip nguồn",
      "startSec": 0.0,
      "endSec": 3.0,
      "durationSec": 3.0,
      "subtitleText": "Hook 3s phụ đề hiển thị",
      "speed": 1.0,
      "transition": "fade"
    }
  ],
  "backgroundMusic": "ambient_chill_beat",
  "outroLogo": "logo.png"
}
`;

    const userPrompt = `
Yêu cầu dựng video:
- Danh sách clip nguồn có sẵn: ${JSON.stringify(
      clipList.map((c) => ({ id: c.id, name: c.name, duration: c.duration }))
    )}
- Hướng dẫn phong cách đạo diễn: ${prompt || "Dựng video TikTok 9:16 recap buổi sinh hoạt nhiếp ảnh sôi động, nhịp nhanh"}
- Thời lượng mục tiêu: ${duration} giây
- Tỷ lệ: ${ratio}
`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    let parsedEDL: EditDecisionList;

    try {
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedEDL = JSON.parse(cleaned);
      parsedEDL.id = `edl_${Date.now()}`;
      parsedEDL.createdAt = new Date().toISOString();
    } catch (parseErr) {
      console.warn("Parse JSON fallback for EDL:", parseErr);
      parsedEDL = {
        id: `edl_${Date.now()}`,
        title: "Video Recap CLB Nhiếp Ảnh LTD (9:16)",
        aspectRatio: ratio,
        targetDuration: duration,
        shots: clipList.length > 0
          ? clipList.map((c, i) => ({
              id: `shot_${i + 1}`,
              clipId: c.id,
              clipName: c.name,
              startSec: 0.0,
              endSec: Math.min(c.duration, 5.0),
              durationSec: Math.min(c.duration, 5.0),
              subtitleText: i === 0 ? "Khám phá góc nhìn nhiếp ảnh cùng LTD" : "Những khoảnh khắc đẹp nhất",
              transition: "cut",
            }))
          : [
              {
                id: "shot_1",
                clipId: "demo_1",
                clipName: "demo_intro.mp4",
                startSec: 0.0,
                endSec: 3.0,
                durationSec: 3.0,
                subtitleText: "3 Mẹo Làm Chủ Ánh Sáng Cùng LTD",
                transition: "fade",
              },
              {
                id: "shot_2",
                clipId: "demo_2",
                clipName: "demo_body.mp4",
                startSec: 0.0,
                endSec: 7.0,
                durationSec: 7.0,
                subtitleText: "Góc quay thực tế tại Long Thành",
                transition: "cut",
              },
            ],
        backgroundMusic: "ambient_beat.mp3",
        outroLogo: "logo.png",
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      data: parsedEDL,
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error("Lỗi AI EDL Generator:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi tạo kịch bản EDL" },
      { status: 500 }
    );
  }
}
