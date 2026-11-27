# LTD AI Training Kit – Hướng dẫn đọc và triển khai

**Dự án:** LTD Creative Studio  
**Đơn vị:** LTD – Long Thành Digital Photo Club  
**Phiên bản tài liệu:** 1.0  
**Ngày biên soạn:** 27/11/2026  
**Mục đích:** Bàn giao định hướng sản phẩm, chiến lược kiến thức, quy trình nghiệp vụ và yêu cầu kỹ thuật cho Antigravity.

---

## 1. Bộ tài liệu gồm những gì?

| Tệp | Vai trò | Antigravity cần dùng khi |
|---|---|---|
| `01_LTD_BRAND_WRITER_STRATEGY.md` | Chiến lược xây dựng AI viết nội dung theo phong cách LTD | Audit và làm lại AI Content Writer |
| `02_LTD_CREATIVE_DIRECTOR_PLAYBOOK.md` | Giáo trình huấn luyện AI hoạch định, sáng tạo và điều hành hoạt động CLB | Audit và làm lại AI Creative Director |
| `03_ANTIGRAVITY_IMPLEMENTATION_PROMPT.md` | Prompt tổng điều phối việc audit, thiết kế và triển khai hai AI | Bắt đầu phiên làm việc với Antigravity |
| `04_GOLDEN_SAMPLE_DATASET_TEMPLATE.md` | Mẫu thu thập, phân loại và đánh giá bài viết Fanpage | Chuẩn bị dữ liệu thực tế cho Brand Writer |

## 2. Giới hạn nghiên cứu cần biết

Chủ sở hữu dự án cung cấp Fanpage chính thức: https://www.facebook.com/longthanhdigitalphotoclub

Trong lần nghiên cứu ngày 27/11/2026, công cụ truy cập web không lấy được nội dung trực tiếp từ Fanpage (Facebook trả lỗi throttling/chặn truy xuất). Tìm kiếm công khai cũng chưa trả về đủ bài đăng gốc của LTD để xác định giọng văn bằng chứng.

Vì vậy:

- Không tài liệu nào trong bộ này tuyên bố đã phân tích đầy đủ caption trên Fanpage LTD.
- Các bài của Photoholic, BH Asia, Hội Nhiếp ảnh TP.HCM và nguồn khác chỉ là **case study tham khảo kỹ thuật viết và tổ chức nội dung**, không phải mẫu để sao chép hoặc đại diện cho phong cách LTD.
- Các thông tin về hoạt động, cách đào tạo và tổ chức LTD lấy từ bối cảnh do Project Owner cung cấp trong các trao đổi trước; cần được Ban Điều hành xác nhận trước khi chuyển thành dữ liệu chính thức.
- Muốn hiệu chỉnh giọng viết sát Fanpage LTD, Project Owner cần cung cấp khoảng 20–30 bài viết gốc, ưu tiên 10–15 bài được đánh giá là tiêu biểu.

## 3. Thứ tự làm việc đề nghị

1. Đưa toàn bộ thư mục này cho Antigravity đọc.
2. Yêu cầu Antigravity **audit code hiện tại trước**, không viết lại hệ thống ngay.
3. Kiểm tra model Gemini thực tế đang gọi, API route, prompt, giới hạn token, dữ liệu và các luồng UI.
4. Chuẩn hóa kho kiến thức và dữ liệu bài mẫu.
5. Nâng cấp Brand Writer, chạy bộ test đối chứng.
6. Nâng cấp Creative Director, kiểm thử bằng kế hoạch tháng và kế hoạch một sự kiện thật.
7. Chỉ deploy sau khi Ban Điều hành/Ban Truyền thông nghiệm thu.

## 4. Những nguyên tắc không được phá vỡ

- Giữ mô hình AI hiện tại của LTD (Gemini) trong giai đoạn này; không tự chuyển sang OpenAI hoặc API trả phí.
- Không fine-tune hoặc tuyên bố đã “huấn luyện mô hình” nếu thực tế chỉ dùng prompt/context retrieval.
- Không biến thông tin do AI suy đoán thành sự kiện thật.
- Không tự xác nhận ngày, địa điểm, kinh phí, diễn giả, đối tác, số lượng người hoặc phân công nhân sự.
- Không tự đăng bài, tự gửi thông báo hoặc tự chuyển trạng thái chương trình sang Approved.
- Không đưa dữ liệu cá nhân, email, số điện thoại, thông tin nhạy cảm của thành viên vào kho mẫu hoặc prompt bên ngoài khi không cần thiết.
- Mọi thay đổi schema phải có migration, backup/rollback và kiểm tra tương thích.
- Giữ nguyên các module khác của LTD Creative Studio khi nâng cấp hai AI.

## 5. Cách hiểu đúng về “huấn luyện AI” trong dự án

Ở giai đoạn không có ngân sách, phương pháp được đề xuất là:

1. **Prompt engineering:** viết system instruction và quy trình rõ ràng.
2. **Few-shot examples:** chọn ví dụ tốt để AI tham khảo theo từng loại bài.
3. **Knowledge retrieval:** tìm đúng tài liệu/bài mẫu phù hợp với tác vụ, thay vì nhồi tất cả vào prompt.
4. **Editorial feedback loop:** lưu bản AI, bản người sửa và lý do sửa để cải thiện chỉ dẫn/dữ liệu tham khảo.
5. **Evaluation set:** dùng cùng bộ đề để đo chất lượng qua nhiều phiên bản.

Đây không phải fine-tuning trọng số mô hình. Cần gọi đúng tên kỹ thuật khi mô tả trong UI và tài liệu.

---

## 6. Nguồn nghiên cứu tham khảo

### Case study bài viết và hoạt động nhiếp ảnh

1. **Photoholic – “THE MOMENTS BETWEEN THE MOVES” (27/07/2026)**  
   https://www.findglocal.com/VN/Hanoi/102914369356004/Photoholic---VNUIS-Photography-and-Visual-Art-Club  
   Bài đăng dùng góc nhìn hậu trường: đối lập giữa khoảnh khắc biểu diễn hoàn hảo và hàng giờ chuẩn bị; đặt nhiếp ảnh vào vai trò kể câu chuyện phía sau sân khấu; ghi nhận đơn vị cộng tác và mời người đọc xem bộ ảnh.

2. **BH Asia – “[Recap] Workshop In Photography – Đúng sáng & Đúng nét” (04/09/2026)**  
   https://bhasia.com.vn/blogs/workshop-offline/recap-workshop-in-photography-dung-sang-dung-net  
   Cấu trúc recap rõ: bối cảnh và thông tin sự kiện → nội dung chuyên môn → cách kiến thức áp dụng vào thực hành → giá trị kết nối cộng đồng → lời cảm ơn.

3. **BH Asia – “Offline nhiếp ảnh Nét Thơ” (14/09/2026)**  
   https://bhasia.com.vn/blogs/workshop-offline/recap-offline-nhiep-anh-net-tho  
   Bài viết mở bằng bối cảnh địa điểm/mùa, phát triển trải nghiệm chụp thành một hành trình thị giác, sau đó khép lại bằng ý nghĩa kết nối cộng đồng.

4. **Hội Nhiếp ảnh TP.HCM – “Workshop Nhiếp ảnh tĩnh vật ý niệm” (31/08/2026)**  
   https://hopa.vn/buoi-workshop-nhiep-anh-tinh-vat-y-niem-thu-vi-va-bo-ich/  
   Bài viết làm rõ chuyên môn của diễn giả, đặt chủ đề nghệ thuật vào bối cảnh, mô tả các kỹ thuật và kết nối kỹ thuật với ý tưởng/cảm xúc của tác phẩm.

5. **Trường Đại học Mở TP.HCM – Giới thiệu N.I.M Photo Club**  
   https://ou.edu.vn/tin_tuc/cau-lac-bo-nhiep-anh-n-i-m-photo-club/  
   Tham khảo cách một CLB trình bày hồ sơ tổ chức: tên gọi, đơn vị trực thuộc, mục đích, địa điểm, bộ nhận diện và hoạt động.

6. **Potato Clothing – Feedback đồng phục CLB, mục Long Thành Digital Photo Club**  
   https://potato.clothing/tong-hop-feedback-dong-phuc-clb-tu-cac-truong-thpt-tai-potato-clothing  
   Nguồn bên thứ ba xác nhận một số hình ảnh nhận diện đồng phục của LTD: polo đen phối mảng trắng – xanh. Đây là dữ kiện hình ảnh tham khảo, không phải căn cứ để suy ra giọng văn của Fanpage.

### Lưu ý bản quyền

Không sao chép nguyên caption/bài viết của những đơn vị trên vào dữ liệu huấn luyện LTD. Chỉ rút ra kỹ thuật cấu trúc, cách triển khai câu chuyện và cách tổ chức thông tin. Dữ liệu Golden Samples của LTD phải lấy từ nội dung do CLB sở hữu hoặc được phép sử dụng.
