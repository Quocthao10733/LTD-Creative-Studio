import { NextRequest, NextResponse } from "next/server";
import { ApiError, ThinkingLevel } from "@google/genai";
import { getGeminiClient } from "@/lib/ai/gemini";
import { GeminiModel, resolveGeminiModel } from "@/lib/ai/models";
import { loadSkillGuidance } from "@/lib/ai/skills";
import {
  DIRECTOR_PROMPT_VERSION,
  DIRECTOR_SYSTEM_INSTRUCTION,
  loadDirectorOrganizationContext,
} from "@/lib/ai/knowledge/director/org-knowledge";
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
    const orgContext = loadDirectorOrganizationContext();
    const ai = getGeminiClient();

    const systemPrompt = `${DIRECTOR_SYSTEM_INSTRUCTION}

${orgContext}

HƯỚNG DẪN SKILL TỪ REPO:
${skillGuidance}

NHIỆM VỤ: Tạo đúng 3 đề xuất chương trình / concept KHÁC BIỆT THẬT SỰ cho chủ đề được yêu cầu.
Mỗi đề xuất phải phân tách rõ:
- Fact (từ dữ liệu tổ chức/brief) vs Assumptions / Missing Confirmations (những gì cần Ban Điều hành chốt: địa điểm, người hướng dẫn, ngân sách, thiết bị).
- Trạng thái mặc định luôn là "PROPOSED".
- Shotlist mô tả cảnh/nhịp quay thực tế khả thi; Equipment chỉ nêu loại thiết bị cần thiết và ghi rõ "(Needs confirmation)" nếu chưa có trong Resource Inventory.
- Không tự tạo ngày/giờ cụ thể, không tự cam kết ngân sách hoặc tự phân công tên thành viên nếu chưa có lịch rảnh.
- Trả về DUY NHẤT mảng JSON hợp lệ (3 phần tử), KHÔNG markdown:
[
  {
    "title": "Tên concept ngắn gọn",
    "bigIdea": "Vấn đề cần giải quyết + ý tưởng & giá trị mang lại",
    "format": "Định dạng phù hợp với chủ đề",
    "targetAudience": "Đối tượng cụ thể",
    "shotlist": "Các cảnh/nhịp triển khai hoặc khung chương trình khả thi",
    "equipment": "Loại thiết bị/hậu cần đề xuất (ghi rõ Needs confirmation nếu chưa xác nhận)",
    "timeline": "Trình tự chuẩn bị (T-2 tuần, T-1 tuần, ngày diễn ra, hậu kỳ) — không tự chốt ngày",
    "feasibility": "Đánh giá tính khả thi thực tế & điều kiện phụ thuộc",
    "approvalStatus": "PROPOSED",
    "expectedOutcomes": ["Đầu ra cụ thể 1", "Đầu ra cụ thể 2"],
    "departmentsInvolved": ["COMM", "TECH"],
    "missingConfirmations": ["Cần xác nhận người hướng dẫn", "Cần xác nhận địa điểm/ngân sách"],
    "risks": ["Rủi ro 1 + phương án dự phòng"],
    "kpiTarget": ["KPI mục tiêu (Target) — chưa phải số liệu thực tế"]
  }
]`;

    const userPrompt = `Chủ đề / Mục tiêu: ${topic.trim()}
${typeof focusArea === "string" && focusArea.trim() ? `Định hướng/định dạng ưu tiên: ${focusArea.trim()}` : ""}`;

    const generateWithModel = (requestedModel: GeminiModel) =>
      ai.models.generateContent({
        model: requestedModel,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.65,
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
    const parsed: Array<Omit<IdeaCard, "id" | "createdAt">> = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length !== 3) {
      throw new Error("Gemini không trả về đủ 3 concept theo định dạng yêu cầu.");
    }

    const ideas: IdeaCard[] = parsed.map((item, index) => ({
      ...item,
      approvalStatus: "PROPOSED",
      id: `${Date.now()}_${index}`,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: ideas,
      modelUsed,
      promptVersion: DIRECTOR_PROMPT_VERSION,
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
