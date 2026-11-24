# PRODUCT REQUIREMENTS DOCUMENT (PRD) — LTD CREATIVE STUDIO
**Dự án:** LTD Creative Studio  
**Đơn vị sở hữu:** CLB Nhiếp ảnh LTD (Long Thành Digital Photo Club)  
**Phiên bản:** 1.0 (Draft)  
**Ngày lập:** 23/11/2026  
**Trạng thái:** Chờ phê duyệt (M0 - Architecture & Requirements)

---

## 1. TỔNG QUAN DỰ ÁN & TẦM NHÌN

### 1.1. Bối cảnh & Tầm nhìn
LTD (Long Thành Digital Photo Club) là câu lạc bộ nhiếp ảnh quy tụ các bạn trẻ đam mê nhiếp ảnh, quay phim, kỹ thuật số và sáng tạo nội dung tại Long Thành. Để tối ưu hóa hoạt động truyền thông, chia sẻ ý tưởng và sản xuất video ngắn (TikTok, Facebook Reels/Post), LTD cần một **Workspace sáng tạo tập trung** kết hợp sức mạnh của Generative AI và tự động hóa kỹ thuật số.

**LTD Creative Studio** không chỉ là một ứng dụng chatbot đơn thuần, mà là một **Creative Operations Hub**:
- Quản trị thành viên các ban rõ ràng (Ban Truyền Thông, Ban Kỹ Thuật).
- Tích hợp 3 AI Agents chuyên sâu: Viết bài truyền thông, Lên ý tưởng nội dung, và Biên tập Video tự động.
- Lưu trữ Brand Kit, kho tài sản số (ảnh, video gốc, logo, preset) và lịch phát hành nội dung.

---

## 2. CHÂN DUNG NGƯỜI DÙNG & PHÂN QUYỀN (ROLES & PERSONAS)

### 2.1. Quyết định triển khai đã thống nhất (Design Decisions)
- **Hạ tầng triển khai MVP:** Mô hình Hybrid (Next.js App Router local, gọi trực tiếp Google Gemini API thật, dùng local FFmpeg + HyperFrames xử lý video, cấu trúc sẵn sàng kết nối Supabase Cloud).
- **Quản lý API Key:** Đọc mặc định từ file `.env.local` phía server, đồng thời cung cấp giao diện trong Settings để người dùng có thể nhập hoặc ghi đè API Key cá nhân.
- **Dữ liệu danh bạ ban đầu:** Khởi tạo từ Empty State (không tạo dữ liệu giả), cung cấp form "Thêm thành viên" trực tiếp và công cụ import CSV cho dữ liệu thật của CLB.
- **Giao diện & Theme:** Phong cách Creative Studio SaaS, tự động nhận diện theo hệ điều hành (System preference) kèm nút gạt Dark/Light Mode trên Header.

| Vai trò | Đối tượng thực tế | Nhu cầu chính | Quyền hạn trong hệ thống |
|---|---|---|---|
| **Admin / Chủ nhiệm CLB** | Ban Điều hành LTD | Quản lý toàn bộ workspace, duyệt thành viên, phân quyền, xem thống kê | Toàn quyền (Super Admin) |
| **Trưởng ban / Phê duyệt** | Lead Content, Lead Kỹ thuật | Quản lý công việc ban, duyệt bản thảo bài viết, duyệt video render | Duyệt nội dung, quản lý thành viên ban |
| **Content Creator** | Thành viên Ban Nội dung | Viết caption Facebook, kịch bản TikTok, lên kế hoạch chiến dịch | Tạo bài viết, sinh ý tưởng, xếp lịch nháp |
| **Video Editor** | Thành viên Ban Kỹ thuật | Upload video gốc, ra lệnh AI cắt ghép, preview EDL, xuất video hoàn chỉnh | Quản lý dự án video, can thiệp EDL, render |
| **Member** | Thành viên câu lạc bộ | Tra cứu danh bạ thành viên, xem tài liệu, đề xuất ý tưởng | Xem danh bạ, xem thư viện dùng chung |

---

## 3. BA TÍNH NĂNG AI CỐT LÕI (CORE AI MODULES)

### 3.1. Module 1: AI Content Writer (Trợ lý Truyền thông Đa nền tảng)
* **Mục tiêu:** Tự động tạo caption, bài đăng Facebook và kịch bản video TikTok chuẩn SEO, đúng tone giọng câu lạc bộ nhiếp ảnh.
* **Đầu vào (Input Form):**
  - Nền tảng: Facebook (Fanpage/Group) hoặc TikTok.
  - Mục tiêu bài viết: Tuyển thành viên (Gen recruitment), Recap workshop/phototrip, Chia sẻ kiến thức nhiếp ảnh/thiết bị, Thông báo sự kiện, Minigame/Photo challenge.
  - Dữ kiện xác minh (Fact checklist): Thời gian, địa điểm, diễn giả/khách mời, hashtag chính.
  - Tone & Style: Năng động, chuyên nghiệp nghệ thuật, hài hước Gen Z, truyền cảm hứng.
  - Độ dài mong muốn: Ngắn (< 150 từ), Vừa (150 - 350 từ), Chi tiết/Storytelling (> 350 từ).
* **Đặc tả logic AI:**
  - AI phải quét dữ kiện đầu vào: nếu phát hiện thiếu địa điểm, ngày giờ hoặc thông tin quan trọng, AI **bắt buộc phải đặt câu hỏi hoặc để placeholder rõ ràng** (`[CẦN XÁC MINH: Ngày diễn ra]`), tuyệt đối không tự bịa ngày tháng/địa điểm.
* **Đầu ra (Output):**
  - Tiêu đề giật tít / Hook 3s (cho TikTok).
  - Nội dung hoàn chỉnh chuẩn format từng nền tảng (ngắt dòng dễ đọc, icon phù hợp).
  - Voice-over script & Visual directions (đối với kịch bản TikTok).
  - Bộ Hashtag đề xuất (theo nhóm: CLB, Ngành nhiếp ảnh, Xu hướng).
  - Nút: "Lưu vào Thư viện", "Gửi duyệt", "Tạo biến thể khác (A/B Test)".

### 3.2. Module 2: AI Creative Director (Giám đốc Sáng tạo & Lên Ý tưởng)
* **Mục tiêu:** Brainstorm ý tưởng nội dung, xây dựng chiến dịch truyền thông và phát triển series dài hạn cho LTD.
* **Chức năng chính:**
  - **Brainstorming Hub:** Nhập chủ đề (vd: "Khai thác ánh sáng tự nhiên mùa mưa Long Thành", "Tuyển Gen 3") -> AI đề xuất 5-10 góc tiếp cận độc đáo, phân loại theo format (Reels, Carousel ảnh, Bài viết chia sẻ kinh nghiệm).
  - **Concept Expander (Phát triển ý tưởng chi tiết):** Biến 1 ý tưởng ngắn thành Concept đầy đủ: Big Idea, Thông điệp chính, Đối tượng mục tiêu, Kịch bản sơ bộ, Shot list gợi ý cho Ban Nhiếp ảnh, Thiết bị cần chuẩn bị, Timeline dự kiến.
  - **Campaign Planner (Lập kế hoạch chiến dịch):** Lên lộ trình bài đăng theo tuần/tháng, phân bổ giai đoạn (Teasing -> Launching -> Sustaining -> Recap), đề xuất KPI đo lường.
* **Nguyên tắc dữ liệu:**
  - Tách bạch rõ giữa "Ý tưởng sáng tạo đề xuất" và "Kế hoạch đã được Ban Điều hành duyệt".

### 3.3. Module 3: AI Video Director & Editor (Trợ lý Biên tập Video Thông minh)
* **Mục tiêu:** Tự động hóa quá trình dựng video ngắn từ các đoạn video gốc (raw footage) do Ban Nhiếp ảnh/Kỹ thuật quay.
* **Cách thức hoạt động thực tế (Vibe Coding / Antigravity Execution):**
  - Không ảo tưởng rằng LLM có thể render MP4 trực tiếp; AI hoạt động như một **Đạo diễn kỹ thuật số** chỉ đạo pipeline công cụ:
    1. **Upload & Ingestion:** Người dùng upload 1-5 file video gốc (MP4/MOV). Hệ thống lưu trữ an toàn và trích xuất audio/metadata.
    2. **Phân tích (Speech-to-Text & Vision Analysis):**
       - Trích xuất audio -> Chạy Whisper để nhận diện giọng nói, tách timestamp và nội dung phụ đề.
       - Trích xuất frame đại diện qua FFmpeg -> Dùng Gemini Multimodal Vision API phân tích nhịp, hành động và chất lượng shot.
    3. **Sinh kịch bản dựng (AI EDL - Edit Decision List):**
       - AI xác định đoạn cao trào, bỏ đoạn thừa, sắp xếp thứ tự các shot theo cấu trúc storytelling (Hook 3s -> Nội dung chính -> Kêu gọi hành động).
       - Sinh danh sách Edit Decision List (JSON format): Shot nào, bắt đầu giây thứ mấy, cắt đến giây nào, hiệu ứng chuyển cảnh, phụ đề hiển thị.
    4. **Giao diện Người dùng can thiệp (Interactive Timeline UI):**
       - Thành viên Ban Kỹ thuật có thể xem timeline, kéo thả đổi thứ tự shot, sửa text phụ đề, hoặc gõ prompt: *"Cắt ngắn đoạn mở đầu còn 2 giây và chèn nhạc sôi động hơn"*.
    5. **Render & Encode MP4:**
       - Công cụ Renderer (**HyperFrames** hoặc **Remotion** + **FFmpeg**) chạy ngầm, ghép file, burn-in subtitle, chèn logo CLB và xuất file MP4 chuẩn tỷ lệ 9:16 (TikTok/Reels).
* **Tiêu chí nghiệm thu MVP Video:**
  - Nhận video gốc, sinh bản nháp EDL, render ra đúng file MP4 xem được, có phụ đề và logo LTD.

### 3.4. Module 4: AI Design Studio (Thiết kế Poster, Banner & Canva Canvas Editor)
* **Đối tượng sử dụng chính:** Ban Truyền thông (thiết kế poster sự kiện, cover, ảnh bài đăng) & Ban Kỹ thuật (gắn watermark, căn chỉnh ảnh chụp nghệ thuật).
* **Chức năng chính:**
  1. **In-app Canvas Editor kiểu Canva:**
     - Bộ công cụ kéo thả layer: Văn bản (tiêu đề, thời gian, địa điểm, CTA), hình ảnh chụp của CLB, logo watermark LTD khẩu độ máy ảnh, hình khối trang trí.
     - Preset tỉ lệ mạng xã hội: Facebook Post (1:1, 4:5), Facebook Event Cover (16:9), TikTok/Story/Reels Poster (9:16).
  2. **AI Image Generator (Imagen 3 / Gemini):**
     - Sinh ảnh nền concept nghệ thuật theo mô tả (ví dụ: bối cảnh hoàng hôn, studio phong cách cyberpunk hoặc cổ điển).
  3. **AI Prompt-to-Poster (Auto-Layout):**
     - Nhập chủ đề workshop/sự kiện, AI tự động chọn bố cục, điền nội dung, phân cấp typography và phối màu thương hiệu LTD chuẩn xác.
  4. **Xuất ảnh & Lưu trữ:**
     - Tải ảnh chất lượng cao (PNG/JPEG) về máy tính.
     - Lưu trực tiếp vào Thư viện LTD (`/library`) và gắn liên kết với Lịch nội dung (`/calendar`).
  5. **Tích hợp Trình thiết kế Canva chính thức (Canva Embed & Sync Hub):**
     - Nhúng trực tiếp không gian Canva Workspace với hàng triệu template, font chữ, đồ họa, AI Magic Studio của Canva ngay trong web app LTD.
     - Quản lý link mẫu thiết kế riêng của CLB LTD, đồng bộ kép (ảnh thành phẩm và link Canva để sửa lại) vào Thư viện và Lịch hoạt động.
* **Tiêu chí nghiệm thu:**
  - Thiết kế mượt mà trên không gian Canva nhúng hoặc Canvas nội bộ, AI sinh ảnh nền hoặc bố cục tự động theo chủ đề, lưu trữ link Canva và xuất ảnh PNG sắc nét không vỡ hạt.

---

## 4. CÁC MODULE NGHIỆP VỤ HỆ THỐNG

### 4.1. Dashboard & Thống kê
- Thẻ chỉ số: Số bài viết đã tạo, Kế hoạch tuần này, Dự án video đang xử lý, Yêu cầu chờ duyệt.
- Dữ liệu hiển thị từ Database thật; hiển thị trạng thái rỗng (Empty state) thân thiện khi chưa có dữ liệu.

### 4.2. Danh bạ Thành viên (Member Directory)
- Danh sách thành viên hiển thị theo 2 Ban chính thức của CLB LTD:
  - **Ban Truyền Thông**: Quản trị bài viết, fanpage Facebook, TikTok, ý tưởng, kịch bản, hình ảnh truyền thông và kết nối cộng đồng.
  - **Ban Kỹ Thuật**: Phụ trách chụp ảnh, quay phim, thiết bị máy ảnh/ống kính, hậu kỳ dựng video, âm thanh và kỹ thuật số.
- Bộ lọc theo Ban, Chức vụ (Trưởng ban, Phó ban, Thành viên), Thế hệ (Gen 2026, Gen 1, Gen 2...).
- Tính năng Admin: Thêm/Sửa/Lưu trữ thành viên, Import danh sách qua CSV.
- **Quy chuẩn bảo mật:** Chỉ hiển thị Tên, Ảnh đại diện, Ban, Vai trò, Bio ngắn. Không công khai số điện thoại, email cá nhân hay địa chỉ riêng tư.

### 4.3. Lịch Nội dung (Content Calendar)
- Chế độ xem theo Tháng và Tuần.
- Trạng thái bài đăng: Nháp (Draft) -> Đang xét duyệt (In Review) -> Đã duyệt (Approved) -> Đã lên lịch (Scheduled) -> Đã đăng (Published).
- Đính kèm liên kết tới bài viết/video tương ứng trong hệ thống.

### 4.4. Thư viện Tài sản & Tri thức (LTD Library / Brand Kit)
- Quản lý Logo chính thức của LTD (PNG trong suốt, vector SVG).
- Màu sắc chủ đạo (Brand Guidelines: Deep Navy, Modern Cyan, White).
- Kho intro/outro, nhạc nền bản quyền mở (Royalty-free audio), font chữ thương hiệu.
- Tài liệu quy định câu lạc bộ, hướng dẫn viết bài làm nguồn tham chiếu (Knowledge base) cho AI.

---

## 5. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

1. **Giao diện & Trải nghiệm (UI/UX):**
   - Phong cách: Creative Studio SaaS hiện đại, gam màu tối/sáng hài hòa (Dark Navy, Slate, Cyan accents), phông chữ Sans-serif sắc nét, hỗ trợ Dark Mode.
   - Thân thiện trên cả Desktop (cho Editor/Writer làm việc) và Mobile (cho thành viên tra cứu danh bạ, xem lịch).
2. **Hiệu năng & Bất đồng bộ:**
   - Các tác vụ nặng (xử lý video, render MP4, phân tích audio) bắt buộc phải đưa vào background worker/queue, có thanh tiến độ (Progress bar) và cơ chế báo lỗi, không làm đơ giao diện người dùng.
3. **Bảo mật & Toàn vẹn dữ liệu:**
   - Sử dụng Supabase Auth kết hợp Row Level Security (RLS) để phân quyền chặt chẽ từ tầng cơ sở dữ liệu.
   - Quản lý API Key (Gemini, Supabase Service Role) hoàn toàn ở phía máy chủ (Server-side environment variables), tuyệt đối không để lộ ở client-side code.
