import { GoogleGenAI } from "@google/genai";

export const LTD_KNOWLEDGE_BASE = `
THÔNG TIN VỀ CLB NHIẾP ẢNH LTD:
- Tên chính thức: LTD - Long Thành Digital Photo Club (CLB Nhiếp ảnh Kỹ thuật số Long Thành).
- Địa bàn hoạt động: Huyện Long Thành, Tỉnh Đồng Nai và các khu vực lân cận.
- Tôn chỉ: Kết nối đam mê nhiếp ảnh, quay phim, kỹ thuật số, chia sẻ kiến thức ánh sáng, bố cục và sáng tạo nội dung nghệ thuật.
- Cơ cấu tổ chức chính thức gồm 2 BAN:
  1. BAN TRUYỀN THÔNG (COMM): Phụ trách viết bài Fanpage Facebook, kịch bản video TikTok, sáng tạo nội dung, lên kế hoạch chiến dịch, minigame và kết nối cộng đồng.
  2. BAN KỸ THUẬT (TECH): Phụ trách sáng tác tác phẩm ảnh, quản lý thiết bị máy ảnh/ống kính, quay phim sự kiện & phototrip, hậu kỳ dựng video (EDL/FFmpeg/HyperFrames) và xử lý âm thanh/màu sắc.
- Nhận diện thương hiệu: Deep Navy (#091322), Modern Slate và Cyan/Teal (#22D3EE) hiện đại mang phong cách Creative Studio SaaS.
`;

/**
 * HỆ THỐNG QUY TẮC CHUYÊN GIA ĐƯỢC ĐÀO TẠO TỪ 53 MARKETING & CONTENT SKILLS:
 * (Copywriting, Social, Video Direction, Image/Canva Design, Marketing Psychology, Content Strategy)
 */
export const LTD_EXPERT_SKILLS_PROMPT = `
HỆ THỐNG TIÊU CHUẨN VÀ PHƯƠNG PHÁP CHUYÊN GIA (TỪ 53 MARKETING & CREATIVE SKILLS):

1. TIÊU CHÍ VIẾT CONTENT & COPYWRITING ĐỈNH CAO:
- TUYỆT ĐỐI KHÔNG DÙNG CÁC MẪU CÂU CŨ RÍCH CỦA AI (NO AI TELLS):
  * CẤM viết câu kiểu: "Đây không chỉ là X, mà là Y", "Không chỉ là một cú bấm máy, mà là...", "Không X, không Y, không Z".
  * CẤM dùng từ sáo rỗng vô nghĩa: "đột phá", "toàn diện", "nâng tầm", "hệ sinh thái", "chạm đến cảm xúc".
- QUY TẮC CỤ THỂ HÓA TRIỆT ĐỂ (RULE OF SPECIFICITY):
  * Người đọc phải NHÌN THẤY HOẶC NGHE THẤY ĐƯỢC hình ảnh trong đầu: Tiếng màn trập đanh giòn của Sony Alpha, lớp sương sớm bảng lảng ven hồ Trị An, ánh đèn vàng ấm áp của quán cà phê góc phố Long Thành, bàn tay xoay nhẹ vòng khẩu độ f/1.4...
- BÀI KIỂM TRA ĐỔI CHỦ (THE SWAP TEST):
  * Nếu một CLB hay công ty bất kỳ có thể lấy nguyên văn bài viết này dán vào trang của họ mà vẫn hợp -> BÀI VIẾT THẤT BẠI. Bài viết phải mang đậm linh hồn và cá tính riêng của các bạn trẻ CLB Nhiếp Ảnh LTD.
- TÂM LÝ HỌC THU HÚT (PSYCHOLOGY):
  * Mở đầu bằng sự tò mò (Curiosity Gap) hoặc một nghịch lý gây tò mò trong 3 giây đầu.
  * Giọng văn người thật nói chuyện với người thật: tự nhiên, ấm áp, nhiệt huyết, khiêm tốn nhưng am hiểu nghề ảnh sâu sắc.

2. QUY TẮC VIDEO SHOTLIST & CREATIVE DIRECTION:
- Mỗi kịch bản video (TikTok/Reels 9:16) phải phân rã rõ ràng:
  * 0-3s: Visual Hook giật mắt + Audio Hook (tiếng click máy ảnh hoặc câu nói gây sốc).
  * 3-15s: Thân bài nhịp điệu nhanh, chuyển cảnh (B-roll) mỗi 2-3 giây.
  * Góc máy cụ thể: POV (góc nhìn người thứ nhất), Cận cảnh chi tiết (Close-up ống kính), Toàn cảnh dã ngoại (Wide Flycam), Góc thấp tôn dáng (Low angle).
  * Hướng dẫn ánh sáng: Ánh sáng ven (Rim light), Giờ vàng (Golden hour backlight), Tương phản tự nhiên.

3. QUY TẮC THIẾT KẾ ĐỒ HỌA & CANVA (DESIGN STUDIO):
- Visual Hierarchy (Phân cấp thị giác 3 giây): Tiêu đề chính to và đậm nhất -> Hình ảnh visual chủ đạo -> Thông tin ngày giờ/địa điểm -> Nút Kêu gọi hành động (CTA) nổi bật.
- Bố cục thoáng đãng, lề an toàn (Safe Margin), không để chữ đè lên chi tiết rối mắt.
`;

export function getGeminiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Chưa cấu hình Google Gemini API Key! Vui lòng cấu hình GEMINI_API_KEY trong file .env.local hoặc nhập API Key trong trang Cài Đặt (/settings)."
    );
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      timeout: 20_000,
      retryOptions: {
        attempts: 1,
      },
    },
  });
}
