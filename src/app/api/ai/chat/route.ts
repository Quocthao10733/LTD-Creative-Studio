import { NextRequest, NextResponse } from "next/server";
import { ApiError, ThinkingLevel } from "@google/genai";
import { getGeminiClient } from "@/lib/ai/gemini";
import { GeminiModel, resolveGeminiModel } from "@/lib/ai/models";
import { loadSkillGuidance } from "@/lib/ai/skills";
import {
  WRITER_BRAND_KNOWLEDGE,
  WRITER_PROMPT_VERSION,
  WRITER_STYLE_AND_ANTI_AI_RULES,
} from "@/lib/ai/knowledge/writer/brand-knowledge";
import {
  formatRetrievedSamplesForPrompt,
  retrieveRelevantSamples,
} from "@/lib/ai/knowledge/writer/samples-store";

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
        return "Mô hình Gemini không khả dụng cho key này. Hãy thử chọn mô hình khác trong Cài đặt.";
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

    const { samples, datasetMeta } = retrieveRelevantSamples({
      platform: platform.toLowerCase(),
      tone,
      topic: currentHook,
      limit: 2,
    });
    const samplesContext = formatRetrievedSamplesForPrompt(samples, datasetMeta);

    const isTikTok = platform.toLowerCase().includes("tiktok");
    const isWebsite = platform.toLowerCase().includes("website");
    const skillNames = isWebsite
      ? (["copywriting"] as const)
      : isTikTok
        ? (["social", "video"] as const)
        : (["social"] as const);

    const sectionOverrides = isTikTok
      ? undefined
      : isWebsite
        ? { copywriting: ["Writing Style Rules", "No AI Tells", "Claims Must Be Supportable"] }
        : { social: ["No AI Tells", "Content Ideas by Situation", "Platform Quick Reference"] };

    const skillGuidance = await loadSkillGuidance(skillNames, sectionOverrides);
    const ai = getGeminiClient();

    const systemPrompt = `Bạn là biên tập viên nội dung CLB Nhiếp Ảnh LTD. Chỉnh sửa bài viết theo YÊU CẦU CỤ THỂ của người dùng.

${WRITER_BRAND_KNOWLEDGE}

${samplesContext}

${WRITER_STYLE_AND_ANTI_AI_RULES}

HƯỚNG DẪN SKILL TỪ REPO:
${skillGuidance}

GIỌNG VĂN MỤC TIÊU: ${tone}

NGUYÊN TẮC CHỈNH SỬA:
1. CHỈ SỬA PHẠM VI yêu cầu. Giữ nguyên các phần đang tốt và các dữ kiện đã xác thực.
2. TUYỆT ĐỐI KHÔNG tự thêm dữ kiện, tên người, địa điểm, ngày giờ, thành tích hay thông tin liên hệ mới không có trong bài hiện tại hoặc yêu cầu của người dùng.
3. Viết tiếng Việt tự nhiên, loại bỏ câu sáo, nhịp máy móc và từ ngữ phóng đại thiếu căn cứ.

TRẢ VỀ CHỈ JSON HỢP LỆ:
{
  "reply": "Tóm tắt gọn: đã sửa gì và vì sao",
  "revisedHook": "Hook sau chỉnh sửa",
  "revisedBody": "TOÀN BỘ nội dung sau chỉnh sửa",
  "revisedHashtags": ["#LTD", "#LongThanhDigital"]
}`;

    const userPrompt = `Nền tảng: ${platform}
Giọng văn: ${tone}

Hook HIỆN TẠI:
${currentHook}

Nội dung HIỆN TẠI:
${currentBody}

YÊU CẦU CHỈNH SỬA (tuân thủ nghiêm ngặt):
${userMessage.trim()}`;

    const generateWithModel = (requestedModel: GeminiModel) =>
      ai.models.generateContent({
        model: requestedModel,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.55,
          ...(requestedModel === "gemini-2.5-flash"
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM } }
            : {}),
          responseMimeType: "application/json",
        },
      });

    const fallbackOrder: GeminiModel[] = [
      selectedModel,
      ...(selectedModel !== "gemini-2.0-flash" ? (["gemini-2.0-flash"] as const) : []),
      ...(selectedModel !== "gemini-2.0-flash-lite" ? (["gemini-2.0-flash-lite"] as const) : []),
    ];

    let modelUsed: GeminiModel = selectedModel;
    let response;
    let lastError: unknown;

    for (const candidateModel of fallbackOrder) {
      try {
        modelUsed = candidateModel;
        response = await generateWithModel(candidateModel);
        break;
      } catch (error) {
        lastError = error;
        const canFallback =
          error instanceof ApiError && (error.status === 404 || error.status >= 500);
        if (!canFallback || candidateModel === fallbackOrder[fallbackOrder.length - 1]) {
          throw error;
        }
      }
    }

    if (!response) {
      throw lastError;
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
      promptVersion: WRITER_PROMPT_VERSION,
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
