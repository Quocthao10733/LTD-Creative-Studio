# 03 – MASTER PROMPT CHO ANTIGRAVITY

## Nâng cấp LTD Brand Writer và LTD Creative Director

Hãy đọc toàn bộ tài liệu trong thư mục này trước khi sửa code:

- `00_README_START_HERE.md`
- `01_LTD_BRAND_WRITER_STRATEGY.md`
- `02_LTD_CREATIVE_DIRECTOR_PLAYBOOK.md`
- `04_GOLDEN_SAMPLE_DATASET_TEMPLATE.md`

---

## 1. Vai trò

Bạn là Senior Full-stack Engineer, AI Application Architect, Prompt Engineer, Content Systems Designer và Product Engineer chịu trách nhiệm nâng cấp hai AI trong LTD Creative Studio.

Project Owner là người quyết định sản phẩm cuối cùng. Bạn phải báo cáo trước các thay đổi kiến trúc lớn và không tự ý xóa chức năng hiện có.

## 2. Điều kiện cứng

1. Giữ Gemini provider/model đang được project sử dụng. Không tự thay bằng OpenAI hoặc API trả phí.
2. Không tự đổi model ID nếu chưa audit cách project gọi model và kiểm tra model thực sự khả dụng.
3. Không đưa API key ra frontend hoặc commit vào Git.
4. Không giả định Fanpage LTD đã được phân tích đầy đủ. Nội dung Facebook chưa được tải vào workspace phải được đánh dấu là cần Project Owner cung cấp.
5. Không coi case study của câu lạc bộ khác là giọng văn chính thức của LTD.
6. Không tạo dữ liệu thành viên, lịch sự kiện, ngân sách, địa điểm, đối tác, diễn giả hoặc thành tích giả.
7. Không tự phê duyệt hoặc tự phát hành nội dung/sự kiện.
8. Không đưa PII thành viên vào prompt bên ngoài nếu không cần thiết.
9. Không triển khai mọi thứ trong một lượt. Phải làm theo milestone.

## 3. Giai đoạn A – Audit trước khi code

Kiểm tra toàn bộ source code hiện tại và lập báo cáo:

### Brand Writer
- Model/provider thực tế.
- API routes và service gọi model.
- System prompt hiện tại.
- Cách form tạo brief.
- Các lựa chọn platform/tone/content type.
- Cách xử lý response.
- Cách lưu lịch sử và thư viện.
- Mọi chỗ prompt bị duplicate/hardcode.
- Chi phí/request và giới hạn hiện tại nếu có.

### Creative Director
- Prompt, service và UI hiện tại.
- Cấu trúc dữ liệu ý tưởng/campaign/event/task/calendar.
- Nguồn dữ liệu cơ cấu ban, thành viên, quyền.
- Những chức năng chỉ là prototype và chức năng thực sự kết nối database.

### Kết quả audit

Tạo:
- `docs/ai-upgrade/CURRENT_STATE_AUDIT.md`
- `docs/ai-upgrade/PROPOSED_ARCHITECTURE.md`
- `docs/ai-upgrade/DATA_GAPS.md`
- `docs/ai-upgrade/IMPLEMENTATION_PLAN.md`

Không thay đổi code ở giai đoạn này.

## 4. Giai đoạn B – Brand Knowledge & Dataset

1. Tạo cấu trúc thư mục kiến thức như mô tả trong tài liệu Brand Writer.
2. Tạo schema cho Golden Samples, Editorial Feedback và prompt version.
3. Xây ingestion workflow để Admin nhập bài viết LTD có quyền sử dụng.
4. Hỗ trợ tag loại bài, nền tảng, mục đích, tone, tier, trạng thái duyệt.
5. Không crawl hoặc tự động scrape Facebook trái với quyền truy cập/điều khoản.
6. Tạo chức năng import thủ công từ markdown/CSV/JSON hoặc paste text.
7. Tạo UI để Admin đánh dấu Tier A/B/C/Rejected.
8. Tạo cơ chế retrieval đơn giản trước (metadata + PostgreSQL full-text search nếu DB đang là Supabase/Postgres); không thêm dịch vụ vector trả phí nếu không cần.

## 5. Giai đoạn C – Nâng cấp Brand Writer

1. Tách prompt thành system instruction, task template, brand context và retrieved samples.
2. Chỉ truy xuất ví dụ phù hợp loại bài/platform/tone.
3. Dùng Gemini hiện tại.
4. Có brief analyzer.
5. Nếu thiếu sự kiện/ngày/địa điểm/số liệu/người, hỏi lại hoặc đánh dấu placeholder.
6. Viết nháp theo loại bài.
7. Tự rà soát một lần trong cùng request nếu hợp lý với API hiện tại; tránh tăng số request vô ích.
8. Trả nội dung có thể chỉnh sửa.
9. Lưu bản AI và bản thành viên chỉnh sửa.
10. Có nút duyệt làm Golden Sample và ghi feedback.
11. Giữ lịch sử, thư viện và chức năng hiện có.

## 6. Giai đoạn D – Nâng cấp Creative Director

1. Tạo knowledge sources cho tổ chức, mục tiêu, ban, kỹ năng, tài nguyên, sự kiện, quy tắc duyệt.
2. Tạo workflow 7 phase: Review → Direction → Program Portfolio → Feasibility → Operations → Weekly Execution → Evaluation.
3. Tạo Event Planning Canvas.
4. Tạo WBS/RACI/Task breakdown.
5. Tạo Campaign Integration pre/during/post event.
6. Tạo KPI với phân biệt Target, Estimate, Actual.
7. Phân biệt trạng thái PROPOSED/NEEDS_REVIEW/APPROVED/IN_PROGRESS/COMPLETED/CANCELLED.
8. Chỉ người có quyền mới được phê duyệt.
9. Sau duyệt mới tạo hoặc cập nhật task/calendar theo cơ chế transaction/validation phù hợp.
10. Có báo cáo tháng và event retrospective.

## 7. Giai đoạn E – Tích hợp và bảo vệ dữ liệu

- Audit quyền truy cập theo role.
- Tách dữ liệu công khai và nội bộ.
- Không hiển thị email/số điện thoại thành viên nếu không được phép.
- RLS hoặc authorization server-side theo thiết kế hiện tại.
- Không tin tưởng role gửi từ client.
- Validate mọi dữ liệu AI trả về trước khi ghi database.
- Có log nhưng loại bỏ API key/PII.
- Có quota và error handling cho Gemini.
- Xử lý 429, timeout, invalid response và model unavailable.

## 8. Giai đoạn F – Evaluation

Tạo bộ test theo hai tài liệu chuyên môn.

### Brand Writer
- Tối thiểu 20 briefs.
- Có brief thiếu dữ kiện.
- Có bài recap, tuyển thành viên, chào đón, kiến thức, TikTok.
- Đánh giá factual accuracy, naturalness, brand voice, storytelling, platform fit, editability.
- Đặt factual accuracy làm tiêu chí chặn.

### Creative Director
- Tối thiểu 10 tình huống.
- Có tình huống thiếu ngân sách, thiếu diễn giả, trùng lịch, thiếu dữ liệu KPI.
- Kiểm tra task, deadline, RACI, risks, approval status.

Tạo báo cáo:
- `docs/ai-upgrade/BRAND_WRITER_EVALUATION.md`
- `docs/ai-upgrade/CREATIVE_DIRECTOR_EVALUATION.md`

Không tự chấm tất cả kết quả là tốt. Ghi rõ kết quả test thực tế.

## 9. Giai đoạn G – Kiểm thử và triển khai

- Chạy lint/typecheck/test/build theo package scripts thực tế.
- Test UI desktop/mobile.
- Kiểm thử API và database.
- Kiểm tra lịch sử dữ liệu cũ không bị hỏng.
- Tạo migration và phương án rollback.
- Cập nhật `.env.example` chỉ với tên biến và placeholder.
- Không in secret trong log.
- Báo cáo chính xác chức năng đã hoàn tất và chưa hoàn tất.

## 10. Báo cáo sau mỗi milestone

Sau mỗi giai đoạn, hãy cung cấp:

1. File đã thay đổi.
2. Kiến trúc hoặc luồng đã cập nhật.
3. Kiểm thử đã chạy và kết quả.
4. Chức năng hoạt động thật.
5. Chức năng còn mock/chưa tích hợp.
6. Vấn đề cần Project Owner quyết định.
7. Rủi ro và cách rollback.

**Bắt đầu bằng Giai đoạn A – Audit. Không code trước khi hoàn tất báo cáo audit.**
