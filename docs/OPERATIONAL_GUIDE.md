# CẨM NANG VẬN HÀNH & SỬ DỤNG — LTD CREATIVE STUDIO
**Đơn vị sử dụng:** CLB Nhiếp Ảnh LTD (Long Thành Digital Photo Club)  
**Phiên bản:** 1.0 (Production Release)  
**Ngày phát hành:** 23/11/2026  

---

## 1. TỔNG QUAN HỆ THỐNG

LTD Creative Studio là nền tảng điều hành sáng tạo tập trung của CLB Nhiếp ảnh LTD, phục vụ 2 ban chuyên môn:
- **Ban Truyền Thông (COMM)**: Sáng tạo nội dung, kịch bản TikTok, caption Facebook, quản trị thương hiệu và kết nối cộng đồng.
- **Ban Kỹ Thuật (TECH)**: Quay phim, chụp ảnh, quản lý thiết bị, dựng video ngắn tự động (EDL / FFmpeg), hậu kỳ màu sắc và âm thanh.

---

## 2. HƯỚNG DẪN KHỞI CHẠY ỨNG DỤNG CỤC BỘ

### 2.1. Yêu cầu môi trường
- Máy tính cài sẵn **Node.js v18+** hoặc **v20+**.
- Hệ điều hành: Windows 10/11, macOS hoặc Linux.

### 2.2. Khởi chạy 1-Click
Mở terminal (PowerShell trên Windows) tại thư mục `Project LTD Studio`:
```powershell
# Chạy máy chủ phát triển
npm run dev
```
Sau đó mở trình duyệt tại: **`http://localhost:3000`**

### 2.3. Cấu hình Google Gemini API Key
Có 2 cách để kích hoạt các tính năng AI:
1. **Cách 1 (Khuyên dùng)**: Tạo file `.env.local` ở thư mục gốc dự án:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
2. **Cách 2**: Truy cập trực tiếp trang **Cài Đặt** (`/settings`) trên trình duyệt, dán API Key cá nhân vào ô nhập liệu và bấm **Lưu Cấu Hình**.

---

## 3. QUY TRÌNH VẬN HÀNH CHO CÁC BAN

### 3.1. Dành cho Ban Truyền Thông: AI Content Writer (`/writer`)
1. **Bước 1**: Chọn nền tảng mục tiêu: **Facebook Post** hoặc **TikTok Script**.
2. **Bước 2**: Chọn loại bài viết (Tổng kết workshop, Tuyển Gen mới, Mẹo nhiếp ảnh...) và Giọng văn phù hợp.
3. **Bước 3**: Nhập chủ đề và các **Dữ kiện xác thực** (ngày, giờ, địa điểm chính xác).  
   > *Lưu ý: Nếu không nhập ngày giờ cụ thể, AI sẽ tự động gắn nhãn `[CẦN XÁC MINH]` để tránh bịa đặt số liệu.*
4. **Bước 4**: Bấm nút **"Tạo Bài Viết Với Gemini AI Thật"**.
5. **Bước 5**: Chỉnh sửa trực tiếp nội dung trong ô kết quả nếu cần.
6. **Bước 6**: Bấm **"Sao chép toàn bộ"** để đăng lên mạng xã hội hoặc bấm **"Lưu Vào Thư Viện CLB"** để lưu trữ lâu dài.

---

### 3.2. Dành cho Ban Truyền Thông & Sáng Tạo: AI Creative Director (`/director`)
1. **Bước 1**: Nhập chủ đề muốn phát triển (vd: *Săn bình minh Hồ Trị An*, *Chiến dịch tuyển Gen 2026*...).
2. **Bước 2**: Bấm nút **"Brainstorm"** -> Gemini AI sẽ tạo 3-4 concept sáng tạo chi tiết:
   - Big Idea & Thông điệp cốt lõi.
   - **Shot list gợi ý cho Ban Kỹ Thuật** (góc máy POV, ánh sáng ngược, cận cảnh lens).
   - Thiết bị cần chuẩn bị (lens, tripod, mic).
   - Thời gian đề xuất triển khai.
3. **Bước 3**: Bấm nút **"Đưa Vào Lịch"** trên thẻ concept để chuyển ý tưởng thành sự kiện trên Lịch nội dung CLB.

---

### 3.3. Dành cho Ban Kỹ Thuật: AI Video Editor & Pipeline (`/video`)
1. **Bước 1**: Vào trang Video Editor, kéo thả các clip video raw của buổi chụp/workshop vào khu vực upload (hoặc bấm *"Thêm clip mẫu để test nhanh"*).
2. **Bước 2**: Xem bảng thông số kỹ thuật do `ffprobe` trích xuất (độ phân giải, fps, thời lượng).
3. **Bước 3**: Chọn tỷ lệ khung hình: **9:16 (TikTok/Reels)** hoặc **16:9 (YouTube)**.
4. **Bước 4**: Bấm **"Sinh Kịch Bản Dựng (AI EDL)"** -> AI đóng vai trò Đạo diễn sắp xếp các phân cảnh, chọn điểm cắt (in/out) và tạo câu Hook 3 giây.
5. **Bước 5 (Kiểm tra kỹ thuật)**: Ban Kỹ Thuật xem danh sách phân cảnh (Shots), chỉnh sửa nội dung phụ đề hiển thị, hoặc bỏ các shot không ưng ý.
6. **Bước 6**: Bấm **"Render Video MP4 Thật"** -> Hệ thống gọi FFmpeg H.264 cắt ghép và xuất file video MP4 hoàn chỉnh.
7. **Bước 7**: Xem trước video ngay trên trình duyệt và bấm **"Tải MP4"** để xuất bản.

---

### 3.4. Quản trị Danh Bạ Thành Viên 2 Ban (`/members`)
1. **Xem danh bạ**: Lọc theo tab **Ban Truyền Thông** hoặc **Ban Kỹ Thuật**, tìm kiếm nhanh theo tên, vai trò hoặc thẻ kỹ năng `#tags`.
2. **Thêm thành viên**: Bấm nút **"Thêm Thành Viên"**, điền Họ tên, Ban, Chức vụ, Thế hệ và Kỹ năng chuyên môn.
3. **Chỉnh sửa / Xóa**: Dùng nút bút chì và thùng rác trên từng thẻ thành viên.
4. **Xuất file CSV**: Bấm **"Xuất CSV"** để tải file danh sách có chuẩn UTF-8 BOM, mở bằng Microsoft Excel tiếng Việt sắc nét.
5. **Import CSV**: Bấm **"Import CSV"** và chọn file danh bạ để nạp hàng loạt thành viên vào hệ thống.

---

### 3.5. Lịch Phát Hành Nội Dung & Sự Kiện (`/calendar`)
- Theo dõi lịch trình tháng 30 ngày.
- Bấm **"Thêm Sự Kiện Mới"** để lên lịch workshop, phototrip dã ngoại hoặc bài đăng TikTok.
- Các sự kiện được gắn nhãn ban chịu trách nhiệm rõ ràng (*Ban Truyền Thông*, *Ban Kỹ Thuật*, *Cả 2 Ban*).

---

## 4. NGUYÊN TẮC BẢO MẬT & BẢN QUYỀN NỘI BỘ
1. **Không công khai dữ liệu cá nhân**: Danh bạ chỉ hiển thị Họ tên, Ban, Chức vụ, Thế hệ và Kỹ năng. Không lưu số điện thoại cá nhân hay địa chỉ riêng tư ra ngoài.
2. **Bảo mật API Key**: Tuyệt đối không commit file `.env.local` lên GitHub hay mạng xã hội.
3. **Bản quyền tác phẩm**: Mọi hình ảnh và video gốc đưa vào thư viện phải do thành viên CLB LTD sáng tác hoặc có bản quyền mở phù hợp.
