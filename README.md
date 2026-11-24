# LTD Creative Studio — Long Thành Digital Photo Club

> **Nền tảng AI đồng hành cùng CLB Nhiếp Ảnh LTD**  
> *Sáng tạo nội dung, lan tỏa đam mê, cùng nhau ghi lại những khoảnh khắc đẹp nhất.*

Ứng dụng web workspace tập trung hỗ trợ sáng tạo truyền thông, định hướng ý tưởng và tự động hóa hậu kỳ video cho 2 ban của CLB: **Ban Truyền Thông** và **Ban Kỹ Thuật**.

---

## 🌟 Tính Năng Nổi Bật

### 1. ✍️ AI Content Writer (`/writer`)
- Tự động tạo bài đăng Facebook và kịch bản video ngắn TikTok (30-45s).
- Nạp hướng dẫn viết theo nền tảng từ các skill `social`, `video` và `copywriting`.
- Mặc định luân phiên 10 góc viết, đổi cấu trúc theo chủ đề và tránh lặp các hook đã tạo gần đây trên trình duyệt.
- Chỉ dùng dữ kiện người viết cung cấp; liệt kê thông tin cần bổ sung thay vì tự tạo ngày, địa điểm hoặc trải nghiệm.
- Hỗ trợ Hook 3s giật tít, phân cảnh thời gian, bộ hashtags chuẩn SEO và gợi ý hình ảnh cho Ban Kỹ Thuật.
- Chỉnh sửa trực tiếp, sao chép 1-click và lưu bài vào Thư viện CLB.
- Cần cấu hình Gemini API Key; nếu API lỗi, giao diện báo lỗi thay vì hiển thị bài mẫu giả làm nội dung AI.

### 2. 💡 AI Creative Director (`/director`)
- Brainstorm ý tưởng, xây dựng chiến dịch và lập kế hoạch nội dung.
- Nạp hướng dẫn phù hợp từ `content-strategy`, `social` và `video` để tạo concept/shotlist.
- Phân tích chi tiết: Big Idea, Khán giả mục tiêu, **Shot list khung hình cho Ban Kỹ Thuật**, Thiết bị cần chuẩn bị và thời gian triển khai.
- Nút 1-click **"Đưa Vào Lịch"** để chuyển ý tưởng thành sự kiện lịch phát hành.

### 3. 🎬 AI Video Editor & Pipeline (`/video`)
- Upload video clip raw, trích xuất thông số kỹ thuật (độ phân giải, fps, thời lượng) qua `ffprobe`.
- Gemini AI đóng vai trò Đạo diễn: tự động sinh **Edit Decision List (EDL JSON)**.
- Interactive Timeline Editor: cho phép Ban Kỹ Thuật chỉnh sửa text phụ đề, cắt cúp thời gian và đổi thứ tự shot.
- **Render MP4 Thật**: Gọi FFmpeg H.264 cắt ghép và xuất video MP4 tỷ lệ 9:16 (TikTok/Reels), xem trước trực tiếp trên web và tải về máy.

### 4. 👥 Quản Trị Danh Bạ 2 Ban (`/members`)
- Quản trị nhân sự 2 ban: **Ban Truyền Thông** và **Ban Kỹ Thuật**.
- Tìm kiếm tức thời theo tên, vai trò, thế hệ hoặc thẻ kỹ năng `#tags` (*Portrait, Premiere, Lightroom...*).
- Thêm, sửa, xóa thành viên đầy đủ.
- Công cụ **Xuất CSV** (chuẩn UTF-8 BOM cho Excel tiếng Việt) và **Import CSV** hàng loạt.
- Bảo mật quyền riêng tư: không công khai số điện thoại hay thông tin nhạy cảm.

### 5. 📅 Lịch Nội Dung & Sự Kiện (`/calendar`)
- Lưới lịch 30 ngày trong tháng theo dõi các buổi workshop, phototrip và lịch đăng bài.
- Modal thêm sự kiện mới phân theo ban phụ trách.

### 6. 📚 Thư Viện Brand Kit (`/library`)
- Lưu trữ logo chính thức, mã màu nhận diện thương hiệu và kho lưu trữ bài viết đã tạo.

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình Google Gemini API Key
Tạo file `.env.local` ở thư mục gốc (hoặc sao chép từ `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> Hoặc bạn có thể nhập trực tiếp API Key trên giao diện tại trang **Cài Đặt (`/settings`)**.

### 3. Khởi chạy Development Server
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ: **[http://localhost:3000](http://localhost:3000)**

### 4. Build Production
```bash
npm run build
npm run start
```

---

## 📁 Tài Liệu Thiết Kế Trong Thư Mục `docs/`
- [docs/PRD.md](file:///d:/Project%20LTD%20Studio/docs/PRD.md): Tài liệu yêu cầu sản phẩm chi tiết.
- [docs/TECH_ARCHITECTURE.md](file:///d:/Project%20LTD%20Studio/docs/TECH_ARCHITECTURE.md): Kiến trúc kỹ thuật và giải mã pipeline video.
- [docs/PLAND.md](file:///d:/Project%20LTD%20Studio/docs/PLAND.md): Kế hoạch và lộ trình triển khai qua 7 phase.
- [docs/OPERATIONAL_GUIDE.md](file:///d:/Project%20LTD%20Studio/docs/OPERATIONAL_GUIDE.md): Cẩm nang hướng dẫn sử dụng cho các ban câu lạc bộ.

---

© 2026 **LTD — Long Thành Digital Photo Club**. All rights reserved.
