import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, LTD_KNOWLEDGE_BASE } from "@/lib/ai/gemini";
import { resolveGeminiModel } from "@/lib/ai/models";
import { loadSkillGuidance } from "@/lib/ai/skills";

interface ChatRefineRequest {
  currentHook?: string;
  currentBody?: string;
  platform?: string;
  tone?: string;
  userMessage?: string;
  model?: string;
}

interface RefinedContent {
  reply: string;
  revisedHook: string;
  revisedBody: string;
  revisedHashtags: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRefineRequest = await request.json();
    const {
      currentHook = "",
      currentBody = "",
      platform = "Facebook",
      tone = "Tự nhiên",
      userMessage,
      model,
    } = body;

    if (typeof userMessage !== "string" || !userMessage.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập yêu cầu chỉnh sửa cho AI!" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY?.trim()) {
      return NextResponse.json(
        { success: false, error: "Chưa cấu hình Gemini API Key. Vui lòng thêm khóa trong Cài đặt để chỉnh sửa." },
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

    const isTikTok = platform.toLowerCase().includes("tiktok");
    const skillNames = platform.toLowerCase().includes("website")
      ? ["copywriting"] as const
      : isTikTok
        ? ["social", "video"] as const
        : ["social"] as const;
    const skillGuidance = await loadSkillGuidance(
      skillNames,
      isTikTok ? undefined : { social: ["No AI Tells", "Content Ideas by Situation"] }
    );
    const ai = getGeminiClient();
    const systemPrompt = `
Bạn là biên tập viên nội dung của CLB Nhiếp ảnh LTD.

${LTD_KNOWLEDGE_BASE}

HƯỚNG DẪN SKILL ĐƯỢC NẠP TỪ REPO:
${skillGuidance}

Chỉnh sửa đúng phạm vi người dùng yêu cầu. Giữ nguyên phần đang ổn; không tự thêm dữ kiện, CTA, lời hứa, địa điểm, thời gian hoặc trải nghiệm mới. Viết tự nhiên bằng tiếng Việt, loại bỏ câu sáo và nhịp văn máy móc.
Trả về JSON hợp lệ duy nhất:
{
  "reply": "Tóm tắt ngắn phần đã sửa",
  "revisedHook": "Hook sau chỉnh sửa",
  "revisedBody": "Toàn bộ nội dung sau chỉnh sửa",
  "revisedHashtags": ["#..."]
}
`;
    const userPrompt = `
Nền tảng: ${platform}
Giọng văn: ${tone}
Hook hiện tại:
${currentHook}

Nội dung hiện tại:
${currentBody}

Yêu cầu chỉnh sửa:
${userMessage.trim()}
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
    const parsed: RefinedContent = JSON.parse(cleaned);
    if (
      typeof parsed.reply !== "string" ||
      typeof parsed.revisedHook !== "string" ||
      typeof parsed.revisedBody !== "string" ||
      !Array.isArray(parsed.revisedHashtags)
    ) {
      throw new Error("Gemini trả về nội dung chỉnh sửa không đúng định dạng.");
    }

    return NextResponse.json({
      success: true,
      data: parsed,
      modelUsed: selectedModel,
    });
  } catch (error) {
    console.error("Lỗi Gemini khi chỉnh sửa nội dung:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể chỉnh sửa bằng Gemini. Vui lòng kiểm tra API Key, mô hình đã chọn hoặc thử lại.",
      },
      { status: 502 }
    );
  }
}
