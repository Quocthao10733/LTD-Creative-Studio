import { NextRequest, NextResponse } from "next/server";
import { ApiError, ThinkingLevel } from "@google/genai";
import { getGeminiClient, LTD_KNOWLEDGE_BASE } from "@/lib/ai/gemini";
import { GeminiModel, resolveGeminiModel } from "@/lib/ai/models";
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

function getChatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 401:
      case 403:
        return "Gemini từ chối API key hoặc yêu cầu. Hãy kiểm tra key và quyền truy cập Gemini API.";
      case 404:
        return "Mô hình Gemini không khả dụng cho key này. Hãy tải lại trang và thử lại.";
      case 429:
        return "Gemini đang giới hạn lượt gọi hoặc đã hết quota. Hãy kiểm tra hạn mức của key.";
      default:
        return error.status >= 500
          ? `Dịch vụ Gemini đang lỗi tạm thời (HTTP ${error.status}). Hãy thử lại sau.`
          : `Gemini trả về lỗi HTTP ${error.status}.`;
    }
  }

  if (error instanceof SyntaxError) {
    return "Gemini trả về nội dung không đúng định dạng. Hãy thử chỉnh sửa lại.";
  }

  if (error instanceof Error && error.message === "Gemini trả về nội dung chỉnh sửa không đúng định dạng.") {
    return error.message;
  }

  return "Không thể kết nối Gemini. Hãy kiểm tra kết nối mạng rồi thử lại.";
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

    const generateWithModel = (requestedModel: GeminiModel) =>
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
      modelUsed,
    });
  } catch (error) {
    console.error("Lỗi Gemini khi chỉnh sửa nội dung:", error);
    return NextResponse.json(
      {
        success: false,
        error: getChatErrorMessage(error),
      },
      { status: 502 }
    );
  }
}
