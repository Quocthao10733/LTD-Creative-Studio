import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, LTD_KNOWLEDGE_BASE } from "@/lib/ai/gemini";
import { GenerateContentRequest, GenerateContentResponse } from "@/lib/types/content";

function getMockAiResponse(
  platform: string,
  postType: string,
  tone: string,
  topic: string,
  facts?: string
): GenerateContentResponse {
  if (platform === "tiktok") {
    return {
      hook: `🎬 3 LỖI SAI KHIẾN ẢNH CỦA BẠN TRÔNG NHƯ 'CHỤP VỘI' — BẠN CÓ MẮC PHẢI KHÔNG?`,
      body: `[0-3s] [POV cầm máy ảnh nhìn vào ống kính, vẻ mặt ngạc nhiên] "Đừng bấm máy nếu bạn vẫn đang mắc 3 lỗi cơ bản này!"
[3-12s] [Hình minh họa ảnh bị cháy sáng vs ảnh đo sáng đúng] "Lỗi thứ nhất: Đo sáng sai vùng gắt. Hãy khóa sáng (AEL) vào điểm nhấn thay vì để chế độ đo sáng toàn khung hình!"
[12-25s] [Thao tác chỉnh thông số ISO và khẩu độ trên body máy] "Lỗi thứ hai: Bố cục tham chi tiết. Quy tắc 1/3 và đường dẫn mắt sẽ cứu bức ảnh của bạn trong 5 giây."
[25-35s] [Đoạn phim ngắn nụ cười thành viên LTD đang chụp ảnh dã ngoại] "Và điều quan trọng nhất: Hãy tham gia ngay cùng CLB Nhiếp Ảnh LTD để học hỏi từ các tiền bối Ban Kỹ Thuật!"
[35-40s] [Call to action] "Comment thiết bị bạn đang dùng bên dưới, LTD sẽ tư vấn góc chụp đẹp nhất cho bạn!"`,
      hashtags: [
        "#LTDPhotoClub",
        "#LongThanhDigital",
        "#HocChupAnh",
        "#PhotographyTips",
        "#CameraGear",
        "#TikTokVietNam",
      ],
      visualTips:
        "Tỷ lệ khung hình 9:16. Ánh sáng tự nhiên buổi sáng (Golden Hour), góc máy POV người thứ nhất cầm máy ảnh Sony/Canon, âm thanh nền Beat Lo-fi nhẹ nhàng.",
      factsChecklist: [
        "Dữ kiện xác nhận: Kỹ thuật đo sáng và quy tắc 1/3 chuẩn nhiếp ảnh.",
        facts ? `Dữ kiện người dùng cung cấp: ${facts}` : "Lưu ý: Không tự bịa đặt ngày giờ tổ chức workshop nếu chưa có thông báo chính thức.",
      ],
    };
  }

  // Facebook post
  return {
    hook: `✨ [CLB NHIẾP ẢNH LTD] ${topic.toUpperCase()} — KHI ĐAM MÊ ĐƯỢC KỂ QUA TỪNG KHUNG HÌNH!`,
    body: `Mỗi bức ảnh không đơn thuần là một cú bấm máy, mà là cách chúng ta lưu giữ khoảnh khắc và kể câu chuyện của riêng mình. 📸

Thời gian qua, các thành viên CLB Nhiếp Ảnh Long Thành (LTD) đã cùng nhau đi qua những cung đường tuyệt đẹp, từ sương sớm bến sông đến những vệt sáng phố đêm lung linh.

🌟 Điểm nổi bật trong hoạt động lần này:
• Thực hành kỹ thuật đo sáng và làm chủ ánh sáng tự nhiên cùng Ban Kỹ Thuật.
• Sáng tạo các góc máy độc đáo kết hợp nghệ thuật kể chuyện thị giác.
• Không gian kết nối, chia sẻ kinh nghiệm cầm máy giữa các thế hệ Gen 1, Gen 2 và Gen 2026.

${facts ? `📌 Thông tin xác nhận: ${facts}\n` : ""}💬 "Chụp ảnh không chỉ là lưu giữ khoảnh khắc, mà còn là cách chúng ta cùng nhau lớn lên và thấu hiểu cuộc sống."

👉 Bạn có muốn cùng LTD ghi lại những thước phim và khung hình ấn tượng tiếp theo? Hãy để lại bình luận hoặc nhắn tin trực tiếp cho Fanpage để nhận thông tin hoạt động mới nhất nhé!`,
    hashtags: [
      "#LTDPhotoClub",
      "#LongThanhDigital",
      "#NhiepAnhLongThanh",
      "#CreativeStudio",
      "#DongNaiPhotography",
      "#Gen2026",
    ],
    visualTips:
      "Tỷ lệ 4:5 hoặc 1:1 cho Facebook Album. Kèm bộ ảnh 4-6 tấm (1 ảnh cover toàn cảnh flycam + 3 ảnh cận cảnh thao tác máy + 1 ảnh tập thể CLB). Tone màu trong trẻo, ấm áp.",
    factsChecklist: [
      "Dữ kiện đã xác nhận: Tên CLB Long Thành Digital Photo Club (LTD).",
      facts ? `Dữ kiện bổ sung: ${facts}` : "Cần xác minh: Ngày giờ và địa điểm cụ thể trước khi đăng công khai.",
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateContentRequest = await request.json();
    const { platform, postType, tone, topic, facts, apiKeyOverride, model } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập chủ đề hoặc thông điệp bài viết!" },
        { status: 400 }
      );
    }

    const key = apiKeyOverride?.trim() || process.env.GEMINI_API_KEY?.trim();

    // If API key is available, use real Gemini client
    if (key) {
      try {
        const ai = getGeminiClient(key);
        const selectedModel =
          model === "gemini-2.5-flash" || !model ? "gemini-3.5-flash-lite" : model;

        const systemPrompt = `
Bạn là AI Content Writer chuyên nghiệp của CLB Nhiếp ảnh LTD (Long Thành Digital Photo Club), phụ trách sáng tạo nội dung cho Ban Truyền Thông.
${LTD_KNOWLEDGE_BASE}

QUY TẮC BẮT BUỘC:
1. KHÔNG ĐƯỢC TỰ BỊA ĐẶT ngày tháng, giờ giấc, địa điểm hay tên người chưa được cung cấp.
2. Trả về DUY NHẤT một JSON hợp lệ (không kèm markdown \`\`\`json) theo định dạng:
{
  "hook": "Tiêu đề hoặc Hook thu hút",
  "body": "Nội dung bài viết hoàn chỉnh",
  "hashtags": ["#LTDPhotoClub", "#..."],
  "visualTips": "Gợi ý ảnh chụp hoặc góc quay video",
  "factsChecklist": ["Dữ kiện đã xác nhận: ...", "Dữ kiện cần xác minh: ..."]
}
`;

        const userPrompt = `
Tạo nội dung:
- Nền tảng: ${platform}
- Loại bài: ${postType}
- Giọng văn: ${tone}
- Chủ đề: ${topic}
- Dữ kiện xác thực: ${facts?.trim() || "Chưa cung cấp"}
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
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed: GenerateContentResponse = JSON.parse(cleaned);

        return NextResponse.json({
          success: true,
          data: parsed,
          modelUsed: selectedModel,
        });
      } catch (geminiError: any) {
        console.warn("Gemini call failed, falling back to smart studio generation:", geminiError.message);
        // Fallback to high quality studio response
        const fallback = getMockAiResponse(platform, postType, tone, topic, facts);
        return NextResponse.json({
          success: true,
          data: fallback,
          note: "Đã sử dụng bộ sinh mẫu tối ưu cho CLB LTD. Bạn có thể kiểm tra API Key trong Cài đặt.",
        });
      }
    }

    // No API key provided: use tailored LTD Studio intelligent generation
    const mockData = getMockAiResponse(platform, postType, tone, topic, facts);
    return NextResponse.json({
      success: true,
      data: mockData,
      note: "Chế độ trải nghiệm LTD Studio. Để kích hoạt Gemini Live, hãy thêm API Key trong Cài Đặt.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi xử lý nội dung",
      },
      { status: 500 }
    );
  }
}
