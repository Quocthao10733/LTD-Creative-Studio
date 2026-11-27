import { NextRequest, NextResponse } from "next/server";
import { ApiError, ThinkingLevel } from "@google/genai";
import { getGeminiClient } from "@/lib/ai/gemini";
import { GeminiModel, resolveGeminiModel } from "@/lib/ai/models";
import { loadSkillGuidance } from "@/lib/ai/skills";
import { isWritingAngleId, WRITING_ANGLES } from "@/lib/ai/writing-angles";
import {
  WRITER_BRAND_KNOWLEDGE,
  WRITER_PROMPT_VERSION,
  WRITER_STYLE_AND_ANTI_AI_RULES,
  WRITER_SYSTEM_INSTRUCTION,
} from "@/lib/ai/knowledge/writer/brand-knowledge";
import {
  formatRetrievedSamplesForPrompt,
  retrieveRelevantSamples,
} from "@/lib/ai/knowledge/writer/samples-store";
import { GenerateContentRequest, GenerateContentResponse } from "@/lib/types/content";

function getGeminiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 401:
      case 403:
        return "Gemini từ chối API key hoặc yêu cầu. Hãy kiểm tra key mới, quyền truy cập Gemini API và giới hạn của key.";
      case 404:
        return "Mô hình Gemini không khả dụng cho key này. Hãy thử chọn mô hình khác trong Cài đặt.";
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

function getPlatformGuidance(platform: string): string {
  switch (platform) {
    case "facebook":
      return `=== FACEBOOK PLATFORM GUIDANCE ===
- Phù hợp bài cộng đồng, recap hoạt động, chào đón thành viên, thông báo sự kiện.
- Dòng đầu tiên (Hook) quyết định người đọc có bấm "Xem thêm" hay không.
- Tránh chèn link ngoài bừa bãi nếu không có link chính thức do người dùng cung cấp.
- Kết bài tự nhiên bằng câu hỏi thảo luận, mời xem album hoặc CTA phù hợp mục tiêu.`;
    case "tiktok":
      return `=== TIKTOK / REELS PLATFORM GUIDANCE ===
- Định dạng dọc 9:16, thời lượng tối ưu 15-60 giây.
- Cấu trúc rõ mốc thời gian: [0-3s Visual+Audio Hook] -> [3-15s+ Thân bài & B-roll] -> [CTA tự nhiên].`;
    case "instagram":
      return `=== INSTAGRAM PLATFORM GUIDANCE ===
- Ưu tiên hình ảnh/Reels/Carousel; caption mạch lạc, giữ đúng dữ kiện thật; 5-10 hashtags phù hợp.`;
    case "threads":
      return `=== THREADS PLATFORM GUIDANCE ===
- Ngắn gọn, đi thẳng vào quan điểm hoặc khoảnh khắc thật, dễ mở đối thoại.`;
    case "website":
      return `=== WEBSITE / BLOG PLATFORM GUIDANCE ===
- Cấu trúc: Tiêu đề -> Mở bài -> Các mục H2 rõ ý -> Kết luận/CTA. Rõ ràng, có thông tin xác thực.`;
    default:
      return "";
  }
}

function getToneGuidance(tone: string): string {
  const tones: Record<string, string> = {
    conversational: "Đời thường, gần gũi như thành viên CLB chia sẻ với nhau — tự nhiên, giản dị, ấm áp.",
    artistic: "Nghệ thuật, tinh tế — dùng hình ảnh gợi tả, nhịp văn có chiều sâu nhưng gắn với chi tiết có thật.",
    youthful: "Trẻ trung, năng động — nhịp nhanh, rõ năng lượng tuổi trẻ nhưng không lạm dụng slang khó hiểu.",
    technical: "Chuyên môn, chuẩn xác — tập trung kỹ thuật nhiếp ảnh, quy trình thực hành; dễ hiểu cho người học.",
    inspirational: "Truyền cảm hứng — dựa trên hành trình và nỗ lực thật, tránh khẩu hiệu sáo rỗng.",
    formal: "Trang trọng, rõ ràng — dùng cho thông báo chính thức, tri ân hoặc đối ngoại.",
  };
  return tones[tone] || tones.conversational;
}

function getLengthGuidance(lengthPref: string, platform: string): string {
  if (platform === "tiktok") {
    return "Kịch bản 15-60 giây: Hook 0-3s + Body theo mốc thời gian + CTA";
  }
  switch (lengthPref) {
    case "short":
      return "Ngắn gọn (khoảng 50-100 từ, 3-5 câu rõ ý)";
    case "long":
      return "Đầy đủ chiều sâu (khoảng 160-260 từ, chia đoạn mạch lạc)";
    case "medium":
    default:
      return "Vừa phải (khoảng 90-160 từ, chia 2-4 đoạn dễ đọc)";
  }
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

    if (creativeAngle && !isWritingAngleId(creativeAngle)) {
      return NextResponse.json(
        { success: false, error: "Góc viết không hợp lệ. Vui lòng tải lại trang và thử lại." },
        { status: 400 }
      );
    }

    // Retrieve top 3 relevant Golden Samples (separated from Creative Director KB)
    const { samples: retrievedSamples, datasetMeta } = retrieveRelevantSamples({
      platform,
      postType,
      tone,
      topic,
      limit: 3,
    });
    const retrievedSamplesContext = formatRetrievedSamplesForPrompt(retrievedSamples, datasetMeta);
    const retrievedSampleIds = retrievedSamples.map((s) => s.sample_id);

    // Load skills with platform-appropriate sections
    const isTikTok = platform === "tiktok";
    const isWebsite = platform === "website";
    const skillNames = isWebsite
      ? (["copywriting"] as const)
      : isTikTok
        ? (["social", "video"] as const)
        : (["social"] as const);

    const sectionOverrides = isTikTok
      ? undefined
      : isWebsite
        ? { copywriting: ["Writing Style Rules", "No AI Tells", "Claims Must Be Supportable"] as const }
        : { social: ["No AI Tells", "Content Ideas by Situation", "Platform Quick Reference"] as const };

    const skillGuidance = await loadSkillGuidance(skillNames, sectionOverrides);
    const ai = getGeminiClient();
    const angle = WRITING_ANGLES.find((item) => item.id === creativeAngle) || WRITING_ANGLES[0];
    const recentHookList = Array.isArray(recentHooks)
      ? recentHooks.filter((hook): hook is string => typeof hook === "string").slice(0, 5)
      : [];

    const systemPrompt = `${WRITER_SYSTEM_INSTRUCTION}

${WRITER_BRAND_KNOWLEDGE}

${retrievedSamplesContext}

${WRITER_STYLE_AND_ANTI_AI_RULES}

${getPlatformGuidance(platform)}

HƯỚNG DẪN SKILL BỔ SUNG:
${skillGuidance}

GIỌNG VĂN YÊU CẦU: ${getToneGuidance(tone)}
ĐỘ DÀI MỤC TIÊU: ${getLengthGuidance(lengthPref || "medium", platform)}

NGUYÊN TẮC KIỂM CHỨNG SỰ THẬT (CHẶN BỊA ĐẶT):
1. CHỈ sử dụng thông tin trong mục "Dữ kiện đã cung cấp" và "Hồ sơ thương hiệu đã xác nhận".
2. TUYỆT ĐỐI KHÔNG tự bịa ngày, giờ, địa điểm, tên thành viên, diễn giả, đối tác, thiết bị, số liệu tương tác hay thông tin liên hệ.
3. Nếu thiếu dữ kiện quan trọng (ví dụ: ngày, địa điểm, link đăng ký, người hướng dẫn), đặt placeholder dạng [Cần bổ sung: ...] trong bản nháp và liệt kê rõ vào mảng fact_check.missing_information.
4. Tránh lặp lại hook đã dùng gần đây: ${JSON.stringify(recentHookList)}.

ĐỊNH DẠNG TRẢ VỀ — CHỈ JSON HỢP LỆ, KHÔNG MARKDOWN:
{
  "status": "draft",
  "content_type": "${postType}",
  "platform": "${platform}",
  "headline": "Tiêu đề ngắn gọn (nếu phù hợp loại bài)",
  "hook": "Câu mở đầu 1-2 dòng thu hút, đúng dữ kiện",
  "body": "Nội dung hoàn chỉnh cho ${platform}",
  "cta": "Lời kêu gọi hành động tự nhiên (hoặc chuỗi rỗng nếu chỉ là thông báo)",
  "hashtags": ["#LTD", "#LongThanhDigital"],
  "visualTips": "Gợi ý hình ảnh/video khả thi kèm theo bài đăng",
  "factsChecklist": ["Đã xác nhận: ...", "Cần bổ sung: ..."],
  "fact_check": {
    "unsupported_claims": [],
    "missing_information": [],
    "needs_human_confirmation": true
  },
  "editorial_notes": ["Ghi chú tự rà soát của AI cho Ban Truyền thông"],
  "source_sample_ids": ${JSON.stringify(retrievedSampleIds)}
}`;

    const userPrompt = `Nền tảng: ${platform}
Loại nội dung: ${postType}
Giọng văn: ${tone}
Độ dài: ${lengthPref || "medium"}
Đối tượng đọc: ${targetAudience?.trim() || "Chưa xác định"}
Chủ đề: ${topic.trim()}
Dữ kiện đã cung cấp: ${facts?.trim() || "Không có dữ kiện chi tiết (hãy viết trung thực dựa trên chủ đề và liệt kê rõ thông tin còn thiếu cần bổ sung)"}
Góc tiếp cận gợi ý: ${angle.instruction}`;

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
    const parsed: GenerateContentResponse = JSON.parse(cleaned);

    parsed.status = "draft";
    parsed.source_sample_ids = retrievedSampleIds;
    parsed.prompt_version = WRITER_PROMPT_VERSION;

    return NextResponse.json({
      success: true,
      data: parsed,
      modelUsed,
      promptVersion: WRITER_PROMPT_VERSION,
      datasetMeta,
      retrievedSampleIds,
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
