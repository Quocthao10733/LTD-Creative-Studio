import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, LTD_KNOWLEDGE_BASE } from "@/lib/ai/gemini";
import { AutoLayoutRequest, AutoLayoutResponse, CanvasLayer, CANVAS_PRESETS } from "@/lib/types/design";

export async function POST(request: NextRequest) {
  try {
    const body: AutoLayoutRequest = await request.json();
    const {
      topic,
      presetId = "fb-square",
      eventType = "workshop",
      speakerOrHost = "CLB Nhiếp ảnh LTD",
      dateStr = "15/11/2026",
      timeStr = "09:00 - 11:30",
      locationStr = "Long Thành, Đồng Nai",
      callToAction = "ĐĂNG KÝ NGAY",
      apiKey,
    } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập chủ đề sự kiện hoặc poster cần thiết kế!" },
        { status: 400 }
      );
    }

    const preset = CANVAS_PRESETS[presetId] || CANVAS_PRESETS["fb-square"];

    // Phối màu đặc trưng của CLB LTD
    const colorThemes = {
      workshop: {
        primary: "#2563EB",
        accent: "#06B6D4",
        bg: "#0B132B",
        badgeBg: "rgba(37, 99, 235, 0.2)",
        badgeText: "#38BDF8",
      },
      phototrip: {
        primary: "#F59E0B",
        accent: "#10B981",
        bg: "#0F172A",
        badgeBg: "rgba(245, 158, 11, 0.2)",
        badgeText: "#FBBF24",
      },
      recruitment: {
        primary: "#8B5CF6",
        accent: "#EC4899",
        bg: "#111827",
        badgeBg: "rgba(139, 92, 246, 0.2)",
        badgeText: "#C084FC",
      },
      contest: {
        primary: "#E11D48",
        accent: "#FBBF24",
        bg: "#090D16",
        badgeBg: "rgba(225, 29, 72, 0.2)",
        badgeText: "#FDA4AF",
      },
      general: {
        primary: "#0EA5E9",
        accent: "#6366F1",
        bg: "#0B132B",
        badgeBg: "rgba(14, 165, 233, 0.2)",
        badgeText: "#7DD3FC",
      },
    };

    const currentTheme = colorThemes[eventType] || colorThemes.general;

    // Chuẩn bị fallback an toàn
    const fallbackLayout: AutoLayoutResponse = {
      success: true,
      title: topic.trim().toUpperCase(),
      backgroundColor: currentTheme.bg,
      backgroundImagePrompt: `Cinematic professional camera lens aperture bokeh, photography lighting in background, dark navy and teal gradient, hyper-realistic, 8k resolution`,
      suggestedStockBg:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      colorPalette: {
        primary: currentTheme.primary,
        secondary: "#1E293B",
        accent: currentTheme.accent,
        background: currentTheme.bg,
        textDark: "#0F172A",
        textLight: "#FFFFFF",
      },
      layers: [
        // 1. Thẻ Badge thương hiệu ở trên cùng
        {
          id: "layer-badge",
          type: "text",
          name: "Tag Sự Kiện",
          x: 10,
          y: presetId === "story-tiktok" ? 12 : 8,
          width: 80,
          height: 6,
          text: `LONG THÀNH DIGITAL PHOTO CLUB • ${eventType.toUpperCase()}`,
          fontSize: 16,
          fontWeight: "600",
          color: currentTheme.badgeText,
          textAlign: "center",
          letterSpacing: 2,
          textTransform: "uppercase",
          zIndex: 10,
        },
        // 2. Tiêu đề chính (Headline)
        {
          id: "layer-title",
          type: "text",
          name: "Tiêu Đề Chính",
          x: 8,
          y: presetId === "story-tiktok" ? 22 : 18,
          width: 84,
          height: presetId === "event-cover" ? 22 : 26,
          text: topic.trim().toUpperCase(),
          fontSize: presetId === "event-cover" ? 44 : 48,
          fontWeight: "900",
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.2,
          zIndex: 11,
        },
        // 3. Phụ đề / Slogan
        {
          id: "layer-subtitle",
          type: "text",
          name: "Phụ Đề & Thông Điệp",
          x: 12,
          y: presetId === "story-tiktok" ? 38 : presetId === "event-cover" ? 38 : 36,
          width: 76,
          height: 10,
          text: "Nơi kết nối những tâm hồn đam mê nghệ thuật ánh sáng & ống kính",
          fontSize: 18,
          fontWeight: "normal",
          color: "#94A3B8",
          textAlign: "center",
          lineHeight: 1.4,
          zIndex: 12,
        },
        // 4. Khối Thời gian - Địa điểm
        {
          id: "layer-datetime-box",
          type: "shape",
          name: "Khung Thông Tin",
          x: 15,
          y: presetId === "story-tiktok" ? 54 : 52,
          width: 70,
          height: presetId === "event-cover" ? 16 : 14,
          shapeType: "rounded-rect",
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          borderColor: currentTheme.primary,
          borderWidth: 1,
          borderRadius: 12,
          zIndex: 13,
        },
        {
          id: "layer-datetime-text",
          type: "text",
          name: "Chi Tiết Ngày & Giờ",
          x: 16,
          y: presetId === "story-tiktok" ? 56 : 54,
          width: 68,
          height: 10,
          text: `📅 ${dateStr}  |  ⏰ ${timeStr}\n📍 ${locationStr}`,
          fontSize: 17,
          fontWeight: "600",
          color: "#F8FAFC",
          textAlign: "center",
          lineHeight: 1.4,
          zIndex: 14,
        },
        // 5. Host / Diễn giả
        {
          id: "layer-speaker",
          type: "text",
          name: "Chủ trì / Diễn giả",
          x: 15,
          y: presetId === "story-tiktok" ? 72 : 72,
          width: 70,
          height: 6,
          text: `Host: ${speakerOrHost}`,
          fontSize: 16,
          fontWeight: "600",
          color: currentTheme.accent,
          textAlign: "center",
          zIndex: 15,
        },
        // 6. Nút Call to Action
        {
          id: "layer-cta-bg",
          type: "shape",
          name: "Nút Kêu Gọi",
          x: 28,
          y: presetId === "story-tiktok" ? 82 : 82,
          width: 44,
          height: 8,
          shapeType: "rounded-rect",
          backgroundColor: currentTheme.primary,
          borderRadius: 30,
          zIndex: 16,
        },
        {
          id: "layer-cta-text",
          type: "text",
          name: "Chữ Nút Kêu Gọi",
          x: 28,
          y: presetId === "story-tiktok" ? 84 : 84,
          width: 44,
          height: 5,
          text: `▶ ${callToAction.toUpperCase()}`,
          fontSize: 16,
          fontWeight: "bold",
          color: "#FFFFFF",
          textAlign: "center",
          letterSpacing: 1,
          zIndex: 17,
        },
      ],
      tipsForDesigner: [
        "Nên dùng ảnh nền có khoảng tối (negative space) ở giữa để nổi bật chữ.",
        "Logo khẩu độ LTD nên đặt ở góc trên bên phải hoặc chính giữa phía trên.",
        "Có thể chỉnh độ mờ (opacity) của ảnh nền để tăng độ tương phản.",
      ],
    };

    // Thử gọi Gemini AI để sáng tạo slogan và tiêu đề chuyên sâu
    try {
      const ai = getGeminiClient(apiKey);
      const systemPrompt = `
Bạn là Giám đốc Sáng tạo & Thiết kế Đồ họa (Art Director) của CLB Nhiếp Ảnh LTD (Long Thành Digital Photo Club).
Nhiệm vụ của bạn là nhận chủ đề sự kiện, tự động phân tích và tạo kịch bản thiết kế Poster/Banner hoàn chỉnh theo tỉ lệ ${preset.aspectRatio} (${preset.name}).

${LTD_KNOWLEDGE_BASE}

YÊU CẦU ĐẦU RA JSON DUY NHẤT (không kèm markdown):
{
  "title": "Tiêu đề poster súc tích, viết hoa, đậm chất nhiếp ảnh nghệ thuật (tối đa 6 từ)",
  "subtitle": "Phụ đề hoặc câu slogan truyền cảm hứng ngắn gọn (1 câu)",
  "badgeText": "Tag sự kiện (ví dụ: WORKSHOP CHUYÊN ĐỀ • BAN KỸ THUẬT)",
  "callToAction": "Hành động ngắn (ví dụ: ĐĂNG KÝ THAM GIA, XEM CHI TIẾT)",
  "backgroundImagePrompt": "Mô tả chi tiết bằng tiếng Anh để sinh ảnh AI nền phù hợp với chủ đề",
  "tipsForDesigner": ["Gợi ý 1", "Gợi ý 2"]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Chủ đề sự kiện: "${topic}". Loại sự kiện: "${eventType}". Diễn giả/Host: "${speakerOrHost}". Ngày giờ: "${dateStr} ${timeStr}". Địa điểm: "${locationStr}".`,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "";
      const parsed = JSON.parse(text);

      if (parsed.title) {
        // Cập nhật text từ AI vào các layer
        const dynamicLayers = fallbackLayout.layers.map((layer) => {
          if (layer.id === "layer-title") {
            return { ...layer, text: parsed.title.toUpperCase() };
          }
          if (layer.id === "layer-subtitle" && parsed.subtitle) {
            return { ...layer, text: parsed.subtitle };
          }
          if (layer.id === "layer-badge" && parsed.badgeText) {
            return { ...layer, text: parsed.badgeText.toUpperCase() };
          }
          if (layer.id === "layer-cta-text" && parsed.callToAction) {
            return { ...layer, text: `▶ ${parsed.callToAction.toUpperCase()}` };
          }
          return layer;
        });

        return NextResponse.json({
          ...fallbackLayout,
          title: parsed.title,
          backgroundImagePrompt: parsed.backgroundImagePrompt || fallbackLayout.backgroundImagePrompt,
          layers: dynamicLayers,
          tipsForDesigner: parsed.tipsForDesigner || fallbackLayout.tipsForDesigner,
        });
      }
    } catch (aiErr) {
      console.warn("AI layout prompt fallback triggered:", aiErr);
    }

    // Trả về layout chuẩn của CLB nếu không có API key hoặc lỗi
    return NextResponse.json(fallbackLayout);
  } catch (error: any) {
    console.error("Lỗi API auto-layout:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xử lý tạo layout poster tự động" },
      { status: 500 }
    );
  }
}
