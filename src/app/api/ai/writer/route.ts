import { NextRequest, NextResponse } from "next/server";
import { ApiError, ThinkingLevel } from "@google/genai";
import { getGeminiClient, LTD_KNOWLEDGE_BASE } from "@/lib/ai/gemini";
import { resolveGeminiModel } from "@/lib/ai/models";
import { loadSkillGuidance } from "@/lib/ai/skills";
import { isWritingAngleId, WRITING_ANGLES } from "@/lib/ai/writing-angles";
import { GenerateContentRequest, GenerateContentResponse } from "@/lib/types/content";

const LTD_WRITING_STYLE_REFERENCE = `
🌷 [RECAP] NHỮNG SẮC HOA – NGÀN LỜI TRI ÂN
Mỗi đóa hoa là một lời cảm ơn, mỗi tác phẩm là một tình cảm được gửi gắm đến những người lái đò thầm lặng.
Hòa trong không khí chào mừng Ngày Nhà giáo Việt Nam 20/11, hoạt động cắm hoa đã mang đến những khoảnh khắc thật đẹp. Từ những đôi tay còn vụng về đến sự tỉ mỉ trong từng cách sắp đặt, mỗi giỏ hoa đều chứa đựng sự sáng tạo, tinh thần đồng đội và tình cảm chân thành mà các bạn học sinh muốn gửi đến thầy cô.
Mỗi tác phẩm mang một sắc màu riêng, nhưng tất cả đều chung một ý nghĩa: tri ân những người đã luôn tận tâm dìu dắt và đồng hành cùng chúng ta trên hành trình trưởng thành.
💐 Nhân ngày Nhà giáo Việt Nam 20/11, Long Thành Digital kính chúc quý thầy cô luôn mạnh khỏe, hạnh phúc và giữ mãi ngọn lửa nhiệt huyết với sự nghiệp trồng người!
`;

function getGeminiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 401:
      case 403:
        return "Gemini từ chối API key hoặc yêu cầu. Hãy kiểm tra key mới, quyền truy cập Gemini API và giới hạn của key.";
      case 404:
        return "Mô hình Gemini không khả dụng cho key này. Hãy tải lại trang để dùng mô hình mặc định mới.";
      case 429:
        return "Gemini đang giới hạn lượt gọi hoặc đã hết quota. Hãy kiểm tra hạn mức của key rồi thử lại.";
      default:
        return error.status >= 500
          ? `Dịch vụ Gemini đang lỗi tạm thời (HTTP ${error.status}). Hãy thử lại sau.`
          : `Gemini trả về lỗi HTTP ${error.status}. Hãy kiểm tra cấu hình key và mô hình.`;
    }
  }

  if (error instanceof SyntaxError) {
    return "Gemini trả về nội dung không đúng định dạng. Hãy thử tạo lại bài.";
  }

  return "Không thể kết nối Gemini. Hãy kiểm tra API key, mô hình và kết nối mạng.";
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateContentRequest = await request.json();
    const {
      platform,
      postType,
      tone,
      topic,
      facts,
      targetAudience,
      lengthPref,
      creativeAngle,
      recentHooks = [],
      model,
    } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập chủ đề hoặc thông điệp bài viết!" },
        { status: 400 }
      );
    }

    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) {
      return NextResponse.json(
        { success: false, error: "Chưa cấu hình Gemini API Key. Vui lòng thêm khóa trong Cài đặt để tạo nội dung." },
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

    if (!isWritingAngleId(creativeAngle)) {
      return NextResponse.json(
        { success: false, error: "Góc viết không hợp lệ. Vui lòng tải lại trang và thử lại." },
        { status: 400 }
      );
    }

    const skillNames = platform === "website"
      ? ["copywriting"] as const
      : platform === "tiktok"
        ? ["social", "video"] as const
        : ["social"] as const;
    const skillGuidance = await loadSkillGuidance(
      skillNames,
      platform === "tiktok"
        ? undefined
        : { social: ["No AI Tells", "Content Ideas by Situation"] }
    );
    const ai = getGeminiClient();
    const angle = WRITING_ANGLES.find((item) => item.id === creativeAngle);
    const recentHookList = Array.isArray(recentHooks)
      ? recentHooks.filter((hook): hook is string => typeof hook === "string").slice(0, 5)
      : [];

    const systemPrompt = `
Bạn là một thành viên Ban Truyền thông LTD đang viết cho người theo dõi Fanpage, không phải agency viết quảng cáo.

${LTD_KNOWLEDGE_BASE}

HƯỚNG DẪN SKILL ĐƯỢC NẠP TỪ REPO:
${skillGuidance}

MẪU GIỌNG LTD DO NGƯỜI DÙNG CHỌN:
${LTD_WRITING_STYLE_REFERENCE}
Chỉ học giọng ấm áp, cách nói gần gũi, đoạn văn tự nhiên và cách gắn thông điệp với hoạt động thật. Đây không phải nguồn dữ kiện cho bài mới. Không chép lại câu chữ, cấu trúc lặp hoặc thông tin về hoa, thầy cô, ngày 20/11.

ÁP DỤNG:
- Viết đúng nền tảng, định dạng, đối tượng, giọng văn và độ dài người dùng yêu cầu.
- Chỉ xem phần "Dữ kiện đã cung cấp" là sự thật. Không tự tạo địa điểm, sự kiện, lịch, thành viên, thiết bị đang sở hữu, số liệu hoặc trải nghiệm của CLB.
- Dùng góc viết được yêu cầu như điểm xuất phát, không ép vào đó nếu không hợp dữ kiện.
- Khi loại nội dung là "auto", tự chọn cấu trúc phù hợp chủ đề. Đừng mặc định viết recap, kể chuyện tuổi trẻ hoặc kết bằng lời mời inbox.
- Không lặp công thức "hook gây tò mò -> kể cảnh đẹp -> rút ra bài học -> CTA". Không mở mọi bài bằng câu hỏi, dấu ba chấm, một khung cảnh điện ảnh hoặc "Có những...".
- Giọng "Đời thường": câu chữ như người trong CLB nói với người đọc quen; thẳng, giản dị, không cố làm văn. Tránh các cụm "tụi mình cùng nhau lớn lên", "giữ lại thanh xuân", "chạm đến cảm xúc", "mỗi cú bấm".
- Nếu thiếu dữ kiện, viết ngắn và trung thực thay vì làm bài nghe có vẻ giàu trải nghiệm. Nêu điều cần bổ sung trong factsChecklist.
- Không dùng cảnh máy ảnh, ánh sáng, địa điểm hay cảm xúc trang trí nếu chúng không giúp thông điệp. Không nhồi emoji, hashtag hoặc CTA.
- Độ dài Facebook: short 40-80 từ, medium 80-140 từ, long 140-220 từ. Đừng kéo dài bài để lấp chỉ tiêu.
- Trước khi trả lời, tự kiểm tra: cấu trúc có khác các hook gần đây không; người thật có nói câu này thành tiếng không; có câu nào chỉ để nghe "hay" mà không thêm thông tin không. Sửa hoặc bỏ câu đó.
- Với kịch bản video ngắn, hook phải gắn với chủ đề; phân cảnh/voice-over cần quay được và không khẳng định điều chưa được cung cấp.
- Trả về DUY NHẤT JSON hợp lệ theo schema, không kèm markdown:
{
  "hook": "Hook phù hợp định dạng",
  "body": "Nội dung hoàn chỉnh; kịch bản video có mốc thời gian và hình ảnh khi phù hợp",
  "hashtags": ["#..."],
  "visualTips": "Gợi ý hình ảnh khả thi, không giả định thiết bị hoặc địa điểm",
  "factsChecklist": ["Dữ kiện đã xác nhận: ...", "Cần bổ sung/xác minh: ..."]
}
`;

    const userPrompt = `
Nền tảng: ${platform}
Loại nội dung: ${postType}
Giọng văn: ${tone}
Độ dài: ${lengthPref || "medium"}
Đối tượng: ${targetAudience?.trim() || "Chưa xác định"}
Chủ đề: ${topic.trim()}
Dữ kiện đã cung cấp: ${facts?.trim() || "Không có"}
Góc viết ưu tiên: ${angle?.instruction}
Hook gần đây chỉ để tránh lặp (không sao chép): ${JSON.stringify(recentHookList)}
`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
  } catch (error: unknown) {
    console.error("Lỗi tạo nội dung AI:", error);
    return NextResponse.json(
      {
        success: false,
        error: getGeminiErrorMessage(error),
      },
      { status: 502 }
    );
  }
}
