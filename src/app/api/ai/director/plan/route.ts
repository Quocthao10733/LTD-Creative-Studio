import { NextRequest, NextResponse } from "next/server";
import { ApiError, ThinkingLevel } from "@google/genai";
import { getGeminiClient } from "@/lib/ai/gemini";
import { GeminiModel, resolveGeminiModel } from "@/lib/ai/models";
import {
  DIRECTOR_PROMPT_VERSION,
  DIRECTOR_SYSTEM_INSTRUCTION,
  loadDirectorOrganizationContext,
} from "@/lib/ai/knowledge/director/org-knowledge";
import { DirectorPlanCanvas } from "@/lib/types/director";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      planType = "event_canvas",
      name,
      objective,
      constraints = "",
      monthLabel = "",
      model,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên sự kiện hoặc chủ đề kế hoạch tháng!" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY?.trim()) {
      return NextResponse.json(
        { success: false, error: "Chưa cấu hình Gemini API Key." },
        { status: 503 }
      );
    }

    const selectedModel = resolveGeminiModel(model);
    if (!selectedModel) {
      return NextResponse.json({ success: false, error: "Mô hình Gemini không hợp lệ." }, { status: 400 });
    }

    const orgContext = loadDirectorOrganizationContext();
    const ai = getGeminiClient();

    const systemPrompt = `${DIRECTOR_SYSTEM_INSTRUCTION}

${orgContext}

NHIỆM VỤ: Lập bản thiết kế chi tiết theo chuẩn Event Planning Canvas & 7-Phase Operating System (luôn ở trạng thái PROPOSED).
- Phân tách rõ Target / Estimate / Actual (actual luôn để null).
- Mọi thông tin chưa có trong dữ liệu tổ chức/brief (ngày giờ, địa điểm, người hướng dẫn, ngân sách, thiết bị) phải ghi rõ "Needs confirmation".
- Không tự phê duyệt ngân sách hoặc gán tên cá nhân khi chưa có lịch rảnh.
- Trả về DUY NHẤT JSON hợp lệ, KHÔNG markdown:
{
  "planType": "${planType}",
  "name": "Tên kế hoạch/sự kiện",
  "monthLabel": "${monthLabel}",
  "concept": "Ý tưởng & bối cảnh triển khai",
  "objective": "Mục tiêu SMART / outcome-based",
  "audience": "Đối tượng mục tiêu",
  "expectedOutcomes": ["Đầu ra cụ thể 1", "Đầu ra cụ thể 2"],
  "dateTimeStatus": "Proposed / Needs confirmation",
  "venueStatus": "Proposed / Needs confirmation",
  "capacityStatus": "Dự kiến quy mô (Needs confirmation)",
  "hostStatus": "Chưa phân công / Needs confirmation",
  "departments": ["COMM", "TECH"],
  "equipmentNeeds": ["Loại thiết bị 1 (Needs confirmation)"],
  "budgetStatus": "Chưa xác nhận ngân sách (Needs confirmation)",
  "runSheet": [
    { "time": "T-30 phút", "activity": "Chuẩn bị không gian & kiểm tra thiết bị", "ownerDepartment": "TECH", "equipment": "Theo sự kiện", "notes": "Placeholder" },
    { "time": "00:00", "activity": "Đón thành viên & giới thiệu mục tiêu", "ownerDepartment": "COMM", "equipment": "Check-in", "notes": "" }
  ],
  "raciTasks": [
    {
      "id": "TASK-1",
      "taskName": "Tên đầu việc",
      "deliverable": "Đầu ra mong đợi",
      "responsibleDept": "COMM",
      "accountableRole": "Ban Điều hành",
      "consultedDept": "TECH",
      "informedDept": "ALL",
      "deadlineLabel": "T-7 ngày (Needs confirmation)",
      "priority": "High",
      "status": "todo",
      "completionCriteria": "Tiêu chí nghiệm thu rõ ràng"
    }
  ],
  "campaign": {
    "preEvent": ["Thông báo mở đăng ký (chỉ đăng sau khi APPROVED)"],
    "duringEvent": ["Shot list ghi nhận khoảnh khắc thực tế"],
    "postEvent": ["Recap kiến thức & tổng kết sau sự kiện"]
  },
  "risks": ["Rủi ro + phương án dự phòng"],
  "kpis": [
    { "category": "Learning", "metric": "Số sản phẩm thực hành hoàn thành", "target": "Cần chốt mục tiêu", "estimate": "Chưa ước tính", "actual": null },
    { "category": "Engagement", "metric": "Số người tham dự thực tế", "target": "Cần chốt quy mô", "estimate": "Chưa ước tính", "actual": null }
  ],
  "missingConfirmations": ["Liệt kê đầy đủ các điểm Ban Điều hành cần xác nhận"],
  "approvalStatus": "PROPOSED"
}`;

    const userPrompt = `Loại kế hoạch: ${planType}
Tên chương trình / kế hoạch: ${name.trim()}
Mục tiêu: ${objective?.trim() || "Chưa nêu rõ — hãy đề xuất mục tiêu phù hợp và đánh dấu cần xác nhận"}
Ràng buộc nguồn lực/thời gian/ngân sách: ${constraints?.trim() || "Chưa có thông tin ngân sách và lịch cụ thể"}`;

    const generateWithModel = (requestedModel: GeminiModel) =>
      ai.models.generateContent({
        model: requestedModel,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
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
    for (const candidateModel of fallbackOrder) {
      try {
        modelUsed = candidateModel;
        response = await generateWithModel(candidateModel);
        break;
      } catch (error) {
        const canFallback =
          error instanceof ApiError && (error.status === 404 || error.status >= 500);
        if (!canFallback || candidateModel === fallbackOrder[fallbackOrder.length - 1]) {
          throw error;
        }
      }
    }

    if (!response) throw new Error("Không nhận được phản hồi từ Gemini.");

    const cleaned = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned) as Omit<DirectorPlanCanvas, "planId" | "createdAt" | "updatedAt">;
    const now = new Date().toISOString();

    const plan: DirectorPlanCanvas = {
      ...parsed,
      planId: `PLAN-${Date.now()}`,
      approvalStatus: "PROPOSED",
      exportedToCalendar: false,
      promptVersion: DIRECTOR_PROMPT_VERSION,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({
      success: true,
      data: plan,
      modelUsed,
      promptVersion: DIRECTOR_PROMPT_VERSION,
    });
  } catch (error) {
    console.error("Lỗi tạo Event Canvas:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lập Event Canvas bằng Gemini. Vui lòng thử lại." },
      { status: 502 }
    );
  }
}
