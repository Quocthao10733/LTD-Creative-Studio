import { GoogleGenAI } from "@google/genai";

export const LTD_KNOWLEDGE_BASE = `
THÔNG TIN VỀ CLB NHIẾP ẢNH LTD:
- Tên chính thức: LTD - Long Thành Digital Photo Club (CLB Nhiếp ảnh Kỹ thuật số Long Thành).
- Địa bàn hoạt động: Huyện Long Thành, Tỉnh Đồng Nai và các khu vực lân cận.
- Tôn chỉ: Kết nối đam mê nhiếp ảnh, quay phim, kỹ thuật số, chia sẻ kiến thức ánh sáng, bố cục và sáng tạo nội dung nghệ thuật.
- Cơ cấu tổ chức chính thức gồm 2 BAN:
  1. BAN TRUYỀN THÔNG (COMM): Phụ trách viết bài Fanpage Facebook, kịch bản video TikTok, sáng tạo nội dung, lên kế hoạch chiến dịch, minigame và kết nối cộng đồng.
  2. BAN KỸ THUẬT (TECH): Phụ trách sáng tác tác phẩm ảnh, quản lý thiết bị máy ảnh/ống kính, quay phim sự kiện & phototrip, hậu kỳ dựng video (EDL/FFmpeg/HyperFrames) và xử lý âm thanh/màu sắc.
- Nhận diện thương hiệu: Deep Navy, Modern Slate và Cyan/Teal hiện đại mang phong cách Creative Studio SaaS.
`;

export function getGeminiClient(_apiKeyOverride?: string): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Chưa cấu hình Google Gemini API Key! Vui lòng cấu hình GEMINI_API_KEY trong file .env.local hoặc nhập API Key trong trang Cài Đặt (/settings)."
    );
  }
  return new GoogleGenAI({ apiKey: key });
}
