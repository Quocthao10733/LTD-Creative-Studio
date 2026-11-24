import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, LTD_KNOWLEDGE_BASE } from "@/lib/ai/gemini";
import { IdeaCard } from "@/lib/types/director";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, focusArea, model, apiKeyOverride } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập chủ đề bạn muốn lên ý tưởng!" },
        { status: 400 }
      );
    }

    const ai = getGeminiClient(apiKeyOverride);
    const selectedModel =
      model === "gemini-2.5-flash" || !model ? "gemini-3.5-flash-lite" : model;

    const systemPrompt = `
Bạn là AI Creative Director (Giám đốc Sáng tạo) của CLB Nhiếp ảnh LTD (Long Thành Digital Photo Club).
Nhiệm vụ của bạn là cố vấn chiến lược nội dung, brainstorming các ý tưởng đột phá, định hình concept nghệ thuật và xây dựng kế hoạch triển khai cho 2 ban của CLB: Ban Truyền Thông (COMM) và Ban Kỹ Thuật (TECH).

${LTD_KNOWLEDGE_BASE}

YÊU CẦU ĐẦU RA (JSON FORMAT DUY NHẤT):
Hãy phân tích chủ đề và đề xuất từ 3 đến 4 concept ý tưởng độc đáo, thiết thực, có tính khả thi cao.
Trả về DUY NHẤT một mảng JSON hợp lệ (không kèm markdown \`\`\`json):
[
  {
    "title": "Tiêu đề concept súc tích, hấp dẫn",
    "bigIdea": "Ý tưởng lớn & thông điệp cốt lõi (2-3 câu truyền cảm hứng)",
    "format": "Định dạng (vd: TikTok Short Video 9:16, Phototrip Ngoại Cảnh, Series Facebook Carousel, Workshop Offline)",
    "targetAudience": "Đối tượng người xem / người tham gia chính",
    "shotlist": "Gợi ý góc quay / khung hình chi tiết cho Ban Kỹ Thuật (góc máy POV, ánh sáng ngược, cận cảnh ống kính, flycam...)",
    "equipment": "Thiết bị cần chuẩn bị (máy ảnh, ống kính 50mm f/1.8, gimbal, đèn tản sáng, mic không dây...)",
    "timeline": "Thời điểm đề xuất triển khai trong tháng (vd: Tuần 2 tháng 11, Chủ Nhật tuần thứ 3)",
    "feasibility": "Mức độ khả thi: Cao / Trung bình kèm lưu ý ngắn"
  }
]
`;

    const userPrompt = `
Chủ đề cần lên ý tưởng: ${topic}
${focusArea ? `Trọng tâm định hướng: ${focusArea}` : ""}
Hãy sáng tạo các ý tưởng mang đậm dấu ấn nhiếp ảnh của CLB LTD, kết hợp chặt chẽ giữa Ban Truyền Thông và Ban Kỹ Thuật.
`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    let parsed: Array<Omit<IdeaCard, "id" | "createdAt">>;

    try {
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Lỗi parse JSON từ Gemini Director:", responseText);
      parsed = [
        {
          title: `Series: Khám Phá Nhiếp Ảnh LTD — ${topic}`,
          bigIdea: "Tập trung khai thác vẻ đẹp góc nhìn và cảm xúc nhiếp ảnh của người trẻ tại Long Thành.",
          format: "TikTok Short Video (9:16)",
          targetAudience: "Học sinh, sinh viên, người yêu nhiếp ảnh tại Đồng Nai.",
          shotlist: "Cận cảnh bàn tay chỉnh khẩu độ, góc nhìn thứ nhất POV, khoảnh khắc bấm máy.",
          equipment: "Body mirrorless, lens 35mm/50mm, mic cài áo.",
          timeline: "Cuối tuần thứ 2 trong tháng",
          feasibility: "Cao — Ban Kỹ thuật phối hợp Ban Truyền thông dễ dàng thực hiện.",
        },
      ];
    }

    const ideas: IdeaCard[] = parsed.map((item, idx) => ({
      ...item,
      id: Date.now().toString() + "_" + idx,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: ideas,
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error("Lỗi gọi Gemini Director:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi xử lý brainstorming. Vui lòng kiểm tra API Key hoặc thử lại.",
      },
      { status: 500 }
    );
  }
}
