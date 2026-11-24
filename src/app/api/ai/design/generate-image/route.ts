import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/ai/gemini";

// Kho ảnh nền nhiếp ảnh chất lượng cao 4K/8K được phân loại theo chủ đề của CLB LTD
const CURATED_BACKGROUNDS = [
  {
    id: "bg-lens-bokeh",
    title: "Khẩu độ ống kính & Bokeh vàng",
    tag: "workshop",
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=85",
    color: "#0F172A",
  },
  {
    id: "bg-dslr-sunset",
    title: "Nhiếp ảnh hoàng hôn ngoại cảnh",
    tag: "phototrip",
    url: "https://images.unsplash.com/photo-1502982720700-bfff97f2da6d?auto=format&fit=crop&w=1600&q=85",
    color: "#180A04",
  },
  {
    id: "bg-studio-dark",
    title: "Phòng Studio ánh sáng nghệ thuật",
    tag: "general",
    url: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1600&q=85",
    color: "#0B132B",
  },
  {
    id: "bg-camera-hand",
    title: "Cầm máy ảnh bắt trọn khoảnh khắc",
    tag: "contest",
    url: "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=1600&q=85",
    color: "#111827",
  },
  {
    id: "bg-neon-cyber",
    title: "Ánh sáng Neon Kỹ thuật số",
    tag: "recruitment",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=85",
    color: "#090D16",
  },
  {
    id: "bg-minimalist-gallery",
    title: "Không gian triển lãm ảnh tối giản",
    tag: "general",
    url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=85",
    color: "#020617",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, theme = "workshop" } = body;

    // 1. Phân tích prompt bằng Gemini để tìm ra gợi ý bối cảnh tốt nhất
    let enhancedDescription = prompt;
    try {
      const ai = getGeminiClient();
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Hãy tối ưu mô tả bối cảnh hình ảnh poster này cho nhiếp ảnh gia CLB LTD: "${prompt}". Trả về 1 câu mô tả ngắn gọn bằng tiếng Việt về ánh sáng, màu sắc và độ tương phản phù hợp để chèn chữ lên.`,
      });
      if (res.text) {
        enhancedDescription = res.text.trim();
      }
    } catch {}

    // Lọc theo theme hoặc trả về danh sách ảnh gợi ý
    const matched = CURATED_BACKGROUNDS.find((bg) => bg.tag === theme) || CURATED_BACKGROUNDS[0];

    return NextResponse.json({
      success: true,
      selectedUrl: matched.url,
      enhancedPrompt: enhancedDescription,
      gallery: CURATED_BACKGROUNDS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi tạo hình nền poster" },
      { status: 500 }
    );
  }
}
