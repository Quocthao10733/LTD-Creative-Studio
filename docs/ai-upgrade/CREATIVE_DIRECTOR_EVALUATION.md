# CREATIVE DIRECTOR EVALUATION REPORT

**Trạng thái:** Đã chuẩn hóa bộ 10 tình huống kiểm thử (`src/lib/ai/evaluation/test-suites.ts`) và nâng cấp pipeline (`director-v2.0.0`).

## Cải tiến đã thực hiện (Trước → Sau)
| Tiêu chí | Trước nâng cấp | Sau nâng cấp (`director-v2.0.0`) |
|---|---|---|
| Nguồn dữ liệu CLB | Ví dụ giả (*studio LTD, Sony CLB có, Anh Huy...*) | Đọc trực tiếp từ `data/members.json` (ẩn PII) và `data/resource_inventory.json` |
| Quy trình lập kế hoạch | Chỉ sinh 3 `IdeaCard` rời rạc | Có Event Planning Canvas, Run Sheet, WBS/RACI, Campaign Pre/During/Post, KPI (Target/Estimate/Actual) |
| Kiểm soát phê duyệt | Cho phép đưa thẳng vào lịch | Mặc định `PROPOSED`; server API `/api/director/plans` chặn duyệt nếu không phải vai trò Ban Điều hành / Trưởng Ban |

## Ghi chú nghiệm thu thực tế
- Bộ 10 tình huống (`D-01` đến `D-10`) đã được định nghĩa trong [test-suites.ts](file:///d:/Project%20LTD%20Studio/src/lib/ai/evaluation/test-suites.ts).
- Cần Ban Điều hành chạy thử trực tiếp trên 3 tab của `/director` (Brainstorm, Event Canvas & Phê Duyệt, Nguồn Lực CLB) với dữ liệu thật để nghiệm thu.
