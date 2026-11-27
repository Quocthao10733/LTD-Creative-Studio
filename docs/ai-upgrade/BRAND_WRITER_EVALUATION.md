# BRAND WRITER EVALUATION REPORT

**Trạng thái:** Đã chuẩn hóa bộ test 20 briefs (`src/lib/ai/evaluation/test-suites.ts`) và nâng cấp pipeline (`writer-v2.0.0`).  
**Dataset hiện tại:** `INITIAL_BATCH` (`8 / 20–30` bài thật trong `data/golden_samples.json`).

## Cải tiến đã thực hiện (Trước → Sau)
| Tiêu chí | Trước nâng cấp | Sau nâng cấp (`writer-v2.0.0`) |
|---|---|---|
| Nguồn ví dụ | Hardcode ví dụ giả (*Anh Tuần, Anh Minh, Highland Coffee...*) | Truy xuất động 2–4 bài thật từ `data/golden_samples.json` |
| Factual Accuracy | Chỉ có `factsChecklist: string[]` | Bổ sung `fact_check` (`missing_information`, `unsupported_claims`, `needs_human_confirmation`) |
| Feedback Loop | Chưa có | Lưu `ai_draft`, `human_final`, `edit_types`, `review_rating` qua `/api/knowledge/feedback` |

## Ghi chú nghiệm thu thực tế
- Bộ 20 briefs (`W-01` đến `W-20`) đã sẵn sàng trong [test-suites.ts](file:///d:/Project%20LTD%20Studio/src/lib/ai/evaluation/test-suites.ts).
- **Chưa tự chấm điểm 5/5:** Điểm Rubric 1–5 (đặc biệt `Factual accuracy` là tiêu chí chặn) cần 2 thành viên Ban Truyền thông chạy đối chứng trực tiếp trên `/writer` với Gemini API key thật và lưu kết quả đánh giá qua Feedback Loop.
