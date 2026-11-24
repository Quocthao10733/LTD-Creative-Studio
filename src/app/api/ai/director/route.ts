import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, LTD_KNOWLEDGE_BASE, LTD_EXPERT_SKILLS_PROMPT } from "@/lib/ai/gemini";
import { IdeaCard } from "@/lib/types/director";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, focusArea, model } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập chủ đề bạn muốn lên ý tưởng!" },
        { status: 400 }
      );
    }

    const key = process.env.GEMINI_API_KEY?.trim();

    if (key) {
      try {
        const ai = getGeminiClient();
        const selectedModel =
          model === "gemini-2.5-flash" || !model ? "gemini-3.5-flash-lite" : model;

        const systemPrompt = `
Bạn là Giám đốc Sáng tạo (Creative Director) & Đạo diễn Hình ảnh Cấp Cao của CLB Nhiếp ảnh LTD (Long Thành Digital Photo Club), được trang bị phương pháp luận từ 53 kỹ năng Marketing & Điện ảnh hàng đầu.

${LTD_KNOWLEDGE_BASE}

${LTD_EXPERT_SKILLS_PROMPT}

NHIỆM VỤ:
Brainstorming các concept ý tưởng mang tính nghệ thuật cao, có góc nhìn độc đáo, không sáo rỗng và kết hợp hoàn hảo giữa Ban Truyền Thông (COMM) và Ban Kỹ Thuật (TECH).

QUY TẮC BẮT BUỘC CHO SHOTLIST & THIẾT BỊ:
- Shotlist phải mô tả cụ thể cỡ cảnh (Close-up, Wide, POV), chuyển động máy (Whip pan, Tracking), hướng ánh sáng (Golden hour, Rim light).
- Thiết bị phải nêu rõ tiêu cự ống kính thực tế (ví dụ: 85mm f/1.4 cho chân dung, 24mm f/1.4 góc rộng, Gimbal, Mic thu âm).

YÊU CẦU ĐẦU RA (JSON FORMAT DUY NHẤT):
Trả về DUY NHẤT một mảng JSON hợp lệ (không kèm markdown \`\`\`json):
[
  {
    "title": "Tiêu đề concept súc tích, đậm chất nghệ thuật",
    "bigIdea": "Ý tưởng lớn & thông điệp cốt lõi (2-3 câu giàu hình tượng và cảm xúc)",
    "format": "Định dạng (vd: TikTok Short Video 9:16, Phototrip Dã Ngoại, Series Album Facebook, Workshop Kỹ Thuật)",
    "targetAudience": "Đối tượng khán giả mục tiêu cụ thể",
    "shotlist": "Chỉ dẫn góc máy, ánh sáng và phân cảnh chi tiết cho Ban Kỹ Thuật",
    "equipment": "Thiết bị cụ thể (máy ảnh Sony/Canon, tiêu cự lens, gimbal, mic thu âm)",
    "timeline": "Thời điểm đề xuất triển khai",
    "feasibility": "Mức độ khả thi kèm lưu ý thực tế"
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
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed: Array<Omit<IdeaCard, "id" | "createdAt">> = JSON.parse(cleaned);

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
      } catch (geminiError: any) {
        console.warn("Gemini Director API error, using fallback concepts:", geminiError.message);
      }
    }

    // Contextual Fallback Concepts when GEMINI_API_KEY is not yet configured
    const fallbackIdeas: IdeaCard[] = [
      {
        id: Date.now().toString() + "_0",
        title: `Series TikTok 9:16: "Một Cú Bấm — Triệu Cảm Xúc" (${topic})`,
        bigIdea: `Khai thác vẻ đẹp chân thực xoay quanh chủ đề "${topic}". Ban Kỹ Thuật ghi lại khoảnh khắc bắt trọn ánh sáng tự nhiên, Ban Truyền Thông dẫn dắt câu chuyện thanh xuân đầy cảm xúc.`,
        format: "TikTok Short Video 9:16 & Reels",
        targetAudience: "Học sinh THPT Long Thành và giới trẻ yêu thích nhiếp ảnh số.",
        shotlist: "Mở đầu bằng tiếng màn trập (shutter click), chuyển cảnh mượt mà từ hậu trường sang bức ảnh hoàn thiện được blend màu Deep Navy/Teal đặc trưng của LTD.",
        equipment: "Điện thoại quay 4K/Sony A7, gimbal chống rung, mic cài áo không dây.",
        timeline: "Tuần 2 trong tháng (Triển khai 3 tập)",
        feasibility: "Cao — Dễ quay dựng, tương tác tốt trên nền tảng video ngắn.",
        createdAt: new Date().toISOString(),
      },
      {
        id: Date.now().toString() + "_1",
        title: `Workshop Kỹ Thuật & Trải Nghiệm Thực Tế: "${topic}"`,
        bigIdea: `Buổi sinh hoạt chuyên môn kết nối toàn bộ thành viên Gen LTD, thực hành căn chỉnh góc máy, làm chủ ánh sáng và bố cục nhiếp ảnh theo chủ đề "${topic}".`,
        format: "Workshop Offline kết hợp Mini Photowalk",
        targetAudience: "Toàn bộ thành viên CLB LTD và các bạn học sinh mới gia nhập.",
        shotlist: "Góc quay toàn cảnh phòng workshop, cận cảnh thao tác xoay ống kính, phỏng vấn nhanh cảm nghĩ người tham gia.",
        equipment: "Máy chiếu, màn hình, máy ảnh mirrorless, ống kính chân dung 50mm/85mm, hắt sáng.",
        timeline: "Chiều Chủ Nhật tuần thứ 3 trong tháng",
        feasibility: "Cao — Ban Kỹ Thuật chuẩn bị giáo án thực hành, Ban Truyền Thông truyền thông trước 5 ngày.",
        createdAt: new Date().toISOString(),
      },
      {
        id: Date.now().toString() + "_2",
        title: `Bộ Ảnh Triển Lãm & Carousel Fanpage: "Hơi Thở Long Thành — ${topic}"`,
        bigIdea: `Tuyển chọn những góc nhìn nghệ thuật đặc sắc nhất của các tay máy LTD, thiết kế dưới dạng Carousel kèm thông số EXIF (khẩu độ, ISO, tốc độ) để tôn vinh kỹ thuật nhiếp ảnh.`,
        format: "Series Facebook Carousel & Album Fanpage",
        targetAudience: "Cộng đồng mạng theo dõi Fanpage CLB Nhiếp Ảnh LTD.",
        shotlist: "Bộ ảnh chụp tĩnh tỷ lệ 4:5, blend màu theo tone Modern Slate sang trọng, lồng ghép trích dẫn cảm xúc.",
        equipment: "Kho lưu trữ ảnh RAW, phần mềm Lightroom/Photoshop của Ban Kỹ Thuật.",
        timeline: "Phát hành vào tối Thứ Bảy lúc 20:00",
        feasibility: "Cao — Tận dụng tối đa nguồn ảnh sẵn có của các thành viên CLB.",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: fallbackIdeas,
      isFallback: true,
      notice: !key ? "Đang dùng concept mẫu (Chưa cấu hình GEMINI_API_KEY)." : undefined,
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
