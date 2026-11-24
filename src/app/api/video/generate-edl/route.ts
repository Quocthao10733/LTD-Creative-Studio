import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, LTD_KNOWLEDGE_BASE } from "@/lib/ai/gemini";
import { EditDecisionList, EDLShot, RawClip } from "@/lib/types/video";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clips, prompt, aspectRatio, targetDuration, apiKeyOverride, model } = body;

    const clipList: RawClip[] = clips || [];
    const ratio = aspectRatio || "9:16";
    const duration = targetDuration || 15;

    const ai = getGeminiClient(apiKeyOverride);
    const selectedModel = model || "gemini-2.5-flash";

    const systemPrompt = `
Bạn là AI Video Director & Editor chuyên nghiệp của CLB Nhiếp ảnh LTD (Long Thành Digital Photo Club).
Nhiệm vụ của bạn là phân tích các đoạn video gốc (raw clips) và xây dựng kịch bản dựng phim kỹ thuật số (Edit Decision List - EDL) theo cấu trúc video ngắn mạng xã hội (TikTok, Facebook Reels):
1. [0-3s]: Hook giật tít, bắt mắt, giữ chân người xem ngay lập tức.
2. [Thân video]: Cắt gọn, loại bỏ khoảng thừa, chuyển cảnh theo nhịp điệu (B-roll, cận cảnh máy ảnh, kỹ thuật nhiếp ảnh).
3. [Outro]: Kêu gọi hành động (Follow LTD Photo Club) kèm logo CLB.

${LTD_KNOWLEDGE_BASE}

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
    },
    ...
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
