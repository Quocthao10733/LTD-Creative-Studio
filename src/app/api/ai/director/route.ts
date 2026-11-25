import { NextRequest, NextResponse } from "next/server";
import { ApiError, ThinkingLevel } from "@google/genai";
import { getGeminiClient, LTD_KNOWLEDGE_BASE } from "@/lib/ai/gemini";
import { resolveGeminiModel } from "@/lib/ai/models";
import { loadSkillGuidance } from "@/lib/ai/skills";
import { IdeaCard } from "@/lib/types/director";

const EXPERT_DIRECTOR_RULES = `
=== QUY TẮC CREATIVE DIRECTOR CHUYÊN GIA ===

1. CONCEPT PHÂN BIỆT THẬT SỰ: 3 concept phải khác biệt về GÓC NHÌN (angle), THÔNG ĐIỆP (message), FORMAT (định dạng). Không được 3 concept cùng format TikTok với hook khác nhau.

2. RULE OF SPECIFICITY: Mỗi concept phải có chi tiết QUAN SÁT ĐƯỢC: địa điểm (hồ Trị An, bến sông Long Thành, phố cổ), thiết bị đề xuất (Sony A7IV + 35mm f/1.4, DJI Mini 4 Pro), hành động quay được (xoay khâu độ, bấm shutter, chỉnh ánh sáng rim light).

3. NO FABRICATION: Tuyệt đối không bịa: hoạt động đã diễn ra, tên thành viên, ngày giờ cụ thể, thiết bị CLB đang sở hữu, KPI kỳ vọng (views, likes).

4. FORMAT-TOPIC FIT: Chọn format HỢP VỚI CHỦ ĐỀ:
   - Tutorial kỹ thuật → Workshop/Reels giáo dục
   - Cảm hứng/Storytelling → Phototrip/Documentary
   - Tuyển thành viên → Carousel/Short video năng động
   - Recap sự kiện → Recap video nhịp nhanh

5. FEASIBILITY THỰC TẾ: Nêu rõ điều kiện THIẾU: "Cần chốt lịch phototrip với Ban Kỹ Thuật", "Cần mượn flycam từ thành viên A", "Cần xin phép quản lý hồ Trị An". Không gán "Dễ triển khai" mặc định.

6. SWAP TEST: Thay "LTD" bằng tên CLB khác → concept vẫn hợp? Nếu có → THẤT BẠI. Phải gắn liền với bản sắc LTD (2 Ban, địa danh Long Thành, văn hóa CLB).
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, focusArea, model } = body;

    if (typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập chủ đề bạn muốn lên ý tưởng!" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY?.trim()) {
      return NextResponse.json(
        { success: false, error: "Chưa cấu hình Gemini API Key. Vui lòng thêm khóa trong Cài đặt để brainstorm." },
        { status: 503 }
      );
    }

    const selectedModel = resolveGeminiModel(model);
    if (!selectedModel) {
      return NextResponse.json(
        { success: false, error: "Mô hình Gemini không được hỗ trợ. Hãy chọn một mô hình trong Cài đặt." },
        { status: 400 }
      );
    }

    const skillGuidance = await loadSkillGuidance(["content-strategy", "social", "video"]);
    const ai = getGeminiClient();
    const systemPrompt = `
Bạn là Creative Director kiêm đạo diễn nội dung cho CLB Nhiếp ảnh LTD (Long Thành Digital Photo Club).

${LTD_KNOWLEDGE_BASE}

HƯỚNG DẪN SKILL ĐƯỢC NẠP TỪ REPO:
${skillGuidance}

${EXPERT_DIRECTOR_RULES}

NHIỆM VỤ:
Tạo đúng 3 concept KHÁC BIỆT THẬT SỰ cho chủ đề người dùng đưa ra. Mỗi concept: góc nhìn riêng, lý do quan tâm, triển khai phù hợp nguồn lực CLB.

NGUYÊN TẮC BẮT BUỘC:
- Không biến mọi chủ đề thành cùng format TikTok/workshop/phototrip. Chọn format HỢP VỚI CHỦ ĐỀ.
- Tránh câu sáo: "thanh xuân", "chạm đến cảm xúc", "một cú bấm triệu cảm xúc" nếu không có chi tiết cụ thể.
- TUYỆT ĐỐI KHÔNG bịa: hoạt động đã diễn ra, tên thành viên, địa điểm/ngày giờ, thiết bị CLB sở hữu, KPI kỳ vọng.
- Shotlist: mô tả hình ảnh/cỡ cảnh/hành động QUAY ĐƯỢC; không ép whip pan, flycam, golden hour nếu không cần.
- Equipment: chỉ nêu LOẠI thiết bị đề xuất, KHÔNG khẳng định CLB sở hữu model cụ thể.
- Timeline: trình tự chuẩn bị/triển khai hoặc "Cần chốt lịch CLB"; không tự đặt ngày giờ.
- Feasibility: nêu điều kiện THIẾU thực tế, không gán "cao" mặc định.
- TRƯỚC KHI TRẢ LỜI: Swap Test - thay "LTD" bằng CLB khác, concept vẫn hợp? Nếu có → VIẾT LẠI.
- Trả về DUY NHẤT mảng JSON hợp lệ (3 phần tử), KHÔNG markdown:
[
  {
    "title": "Tên concept ngắn",
    "bigIdea": "Ý tưởng và thông điệp cốt lõi",
    "format": "Định dạng phù hợp",
    "targetAudience": "Đối tượng cụ thể",
    "shotlist": "Các cảnh/nhịp triển khai có thể quay",
    "equipment": "Loại thiết bị đề xuất",
    "timeline": "Trình tự hoặc điều kiện cần chốt",
    "feasibility": "Điều kiện và rủi ro thực tế còn thiếu"
  }
]
`;
    const userPrompt = `
Chủ đề: ${topic.trim()}
${typeof focusArea === "string" && focusArea.trim() ? `Định hướng/định dạng ưu tiên: ${focusArea.trim()}` : ""}
`;

    const generateWithModel = (requestedModel: string) =>
      ai.models.generateContent({
        model: requestedModel,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
        },
      });

    let modelUsed = selectedModel;
    let response;
    try {
      response = await generateWithModel(selectedModel);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status < 500 || selectedModel === "gemini-3.5-flash-lite") {
        throw error;
      }

      modelUsed = "gemini-3.5-flash-lite";
      response = await generateWithModel(modelUsed);
    }

    const responseText = response.text || "";
    const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed: Array<Omit<IdeaCard, "id" | "createdAt">> = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length !== 3) {
      throw new Error("Gemini không trả về đủ 3 concept theo định dạng yêu cầu.");
    }

    const ideas: IdeaCard[] = parsed.map((item, index) => ({
      ...item,
      id: `${Date.now()}_${index}`,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: ideas,
      modelUsed,
    });
  } catch (error) {
    console.error("Lỗi Gemini Creative Director:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tạo ý tưởng bằng Gemini. Vui lòng kiểm tra API Key, mô hình đã chọn hoặc thử lại.",
      },
      { status: 502 }
    );
  }
}
