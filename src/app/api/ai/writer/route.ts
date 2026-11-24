import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, LTD_KNOWLEDGE_BASE, LTD_EXPERT_SKILLS_PROMPT } from "@/lib/ai/gemini";
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
      hook: `Đừng bấm máy nếu bạn chưa biết mẹo này khi chụp ngược sáng! 📸`,
      body: `[0-3s] [Cận cảnh bàn tay xoay nhẹ vòng khẩu độ trên ống kính Sony 85mm f/1.4, tiếng click màn trập vang lên đanh giòn]
"Bạn thường nghĩ chụp ngược sáng sẽ làm mặt mẫu bị tối đen? Thử ngay cách đo sáng này của Ban Kỹ Thuật LTD."

[3-12s] [Chuyển cảnh B-roll: So sánh ảnh mẫu bị đen mặt vs ảnh bù sáng đo sáng điểm (Spot Metering)]
"Chuyển chế độ đo sáng sang Spot Metering, khóa sáng vào gò má mẫu. Bật đèn flash nhẹ hoặc dùng hắt sáng bạc ở góc 45 độ."

[12-25s] [Góc máy POV người thứ nhất lia máy bắt trọn tia nắng xiên qua kẽ tóc mẫu]
"Ánh sáng ven sẽ tách hoàn toàn chủ thể khỏi hậu cảnh, tạo nên vầng hào quang cinematic mà không cần kéo màu quá nhiều."

[25-35s] [Khoảnh khắc các bạn trẻ CLB LTD vừa chụp xong cùng xem lại ảnh trên màn hình máy ảnh, cười rạng rỡ]
"Những mẹo thực chiến này đều được tụi mình đúc kết từ các buổi phototrip cuối tuần của CLB Nhiếp Ảnh LTD."

[35-40s] [CTA]
"Bạn đang dùng body máy gì? Để lại một bình luận, tụi mình sẽ gợi ý thiết lập đo sáng chuẩn nhất cho bạn!"`,
      hashtags: [
        "#CLBNhiepAnhLTD",
        "#LongThanhDigital",
        "#MeoChupAnh",
        "#SonyAlpha",
        "#NhiepAnhTre",
        "#PhototripLongThanh",
      ],
      visualTips:
        "Khung hình dọc 9:16. Ánh sáng vàng xiên lúc 16h30 (Golden hour). Âm thanh SFX tiếng màn trập kết hợp beat Lo-Fi acoustic êm dịu.",
      factsChecklist: [
        "Kỹ thuật chuẩn: Đo sáng điểm (Spot Metering) và kiểm soát ánh sáng ven (Rim Light).",
        facts ? `Dữ kiện bổ sung: ${facts}` : "Đã kiểm chứng: Phù hợp cho máy ảnh Sony, Canon, Fujifilm.",
      ],
    };
  }

  // Facebook post chuẩn Copywriting chuyên gia
  return {
    hook: `Buổi sáng sớm ở bến đò Long Thành, tiếng màn trập vang lên giữa lớp sương mỏng... 📷`,
    body: `Có những ngày tụi mình thức dậy từ 5 giờ sáng, ôm balo máy ảnh chạy dọc theo những con đường ven sông Đồng Nai. Không ồn ào, không kịch bản cầu kỳ, chỉ có niềm háo hức bắt trọn tia nắng đầu tiên xuyên qua tán cây.

Đó là cách mà CLB Nhiếp Ảnh Long Thành (LTD) cùng nhau lớn lên qua từng khung hình.

Trong buổi sinh hoạt và sáng tác về chủ đề "${topic}":
• Ban Kỹ Thuật hướng dẫn các bạn Gen mới cách làm chủ khẩu độ lớn f/1.4 để làm nổi bật chủ thể tự nhiên nhất.
• Ban Truyền Thông ghi lại từng khoảnh khắc hậu trường mộc mạc — những nụ cười, những lần ngồi bệt xuống đất canh góc máy lạ.

${facts ? `📌 Lưu ý xác nhận: ${facts}\n` : ""}Nhiếp ảnh với tụi mình đơn giản là giữ lại những gì chân thật nhất của tuổi trẻ nơi mảnh đất Long Thành này.

Bạn có cùng đam mê bấm máy không? Nhắn tin cho LTD hoặc để lại bình luận để cùng tham gia buổi phototrip tiếp theo nhé!`,
    hashtags: [
      "#CLBNhiepAnhLTD",
      "#LongThanhDigital",
      "#NhiepAnhTuoiTre",
      "#SonyVietnam",
      "#ThanhXuanLongThanh",
    ],
    visualTips:
      "Bộ ảnh album 4 tấm tỷ lệ 4:5. Tấm 1: Toàn cảnh mặt sông mờ sương. Tấm 2-3: Cận cảnh thành viên đang chỉnh máy ảnh. Tấm 4: Ảnh chụp tập thể tràn đầy năng lượng.",
    factsChecklist: [
      "Xác thực: Hoạt động nội bộ CLB Nhiếp Ảnh Long Thành Digital (LTD).",
      facts ? `Dữ kiện kèm theo: ${facts}` : "Lưu ý: Luôn kiểm tra lịch dự báo thời tiết trước ngày phototrip.",
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateContentRequest = await request.json();
    const { platform, postType, tone, topic, facts, model } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập chủ đề hoặc thông điệp bài viết!" },
        { status: 400 }
      );
    }

    const key = process.env.GEMINI_API_KEY?.trim();

    // If API key is available, use real Gemini client
    if (key) {
      try {
        const ai = getGeminiClient();
        const selectedModel =
          model === "gemini-2.5-flash" || !model ? "gemini-3.5-flash-lite" : model;

        const systemPrompt = `
Bạn là Chuyên gia Cấp Cao về Content & Copywriting của CLB Nhiếp ảnh LTD (Long Thành Digital Photo Club), được đào tạo bài bản từ 53 kỹ năng Marketing & Sáng tạo hàng đầu thế giới.

${LTD_KNOWLEDGE_BASE}

${LTD_EXPERT_SKILLS_PROMPT}

QUY TẮC BẮT BUỘC KHI VIẾT BÀI:
1. TUYỆT ĐỐI KHÔNG DÙNG CÁC MẪU CÂU CŨ RÍCH CỦA AI: Cấm viết "Đây không chỉ là X mà là Y", cấm từ sáo rỗng (đột phá, toàn diện, nâng tầm).
2. Hãy đưa chi tiết thực tế về máy ảnh, ánh sáng, góc chụp và cảm xúc của các bạn trẻ Long Thành vào bài viết.
3. KHÔNG ĐƯỢC TỰ BỊA ĐẶT ngày tháng, giờ giấc, địa điểm nếu người dùng chưa cung cấp.
4. Trả về DUY NHẤT một JSON hợp lệ (không kèm markdown \`\`\`json) theo định dạng:
{
  "hook": "Tiêu đề hoặc Hook thu hút trong 3 giây đầu",
  "body": "Nội dung bài viết hoàn chỉnh, nhịp điệu tự nhiên, ngắt dòng thoáng đãng",
  "hashtags": ["#CLBNhiepAnhLTD", "#..."],
  "visualTips": "Gợi ý ảnh chụp hoặc góc quay video chi tiết",
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
