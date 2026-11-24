import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, LTD_KNOWLEDGE_BASE } from "@/lib/ai/gemini";
import { resolveGeminiModel } from "@/lib/ai/models";
import { loadSkillGuidance } from "@/lib/ai/skills";
import { IdeaCard } from "@/lib/types/director";

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

NHIỆM VỤ:
Tạo đúng 3 concept khác biệt thật sự cho chủ đề người dùng đưa ra. Mỗi concept cần có một góc nhìn riêng, một lý do khiến người xem quan tâm và cách triển khai phù hợp nguồn lực một câu lạc bộ nhiếp ảnh.

NGUYÊN TẮC:
- Không biến mọi chủ đề thành cùng một format TikTok, workshop và phototrip. Chỉ chọn format hợp với chủ đề.
- Tránh câu chữ kiểu "thanh xuân", "chạm đến cảm xúc", "một cú bấm triệu cảm xúc" nếu không có chi tiết cụ thể làm nó có ý nghĩa.
- Không bịa hoạt động đã diễn ra, thành viên, địa điểm, ngày giờ, thiết bị CLB sở hữu hay kết quả kỳ vọng.
- Shotlist mô tả hình ảnh/cỡ cảnh/hành động quay được; không ép kỹ thuật như whip pan, flycam, golden hour nếu không cần thiết.
- Equipment chỉ nêu loại thiết bị đề xuất, không khẳng định CLB đang sở hữu model cụ thể.
- Timeline ghi theo trình tự chuẩn bị/triển khai hoặc "Cần chốt lịch CLB"; không tự đặt ngày hay giờ.
- Feasibility nêu điều kiện thực tế còn thiếu, không gán mức "cao" một cách mặc định.
- Trả về DUY NHẤT một mảng JSON hợp lệ, không kèm markdown:
[
  {
    "title": "Tên concept ngắn",
    "bigIdea": "Ý tưởng và thông điệp",
    "format": "Định dạng phù hợp",
    "targetAudience": "Đối tượng cụ thể",
    "shotlist": "Các cảnh/nhịp triển khai",
    "equipment": "Thiết bị đề xuất",
    "timeline": "Trình tự hoặc điều kiện cần chốt",
    "feasibility": "Điều kiện và rủi ro thực tế"
  }
]
`;
    const userPrompt = `
Chủ đề: ${topic.trim()}
${typeof focusArea === "string" && focusArea.trim() ? `Định hướng/định dạng ưu tiên: ${focusArea.trim()}` : ""}
`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.9,
        responseMimeType: "application/json",
      },
    });

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
      modelUsed: selectedModel,
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
