# IMPLEMENTATION PLAN — LTD AI UPGRADE

- **Giai đoạn A (Audit):** Hoàn tất audit codebase & tạo bộ tài liệu `docs/ai-upgrade/`.
- **Giai đoạn B (Knowledge & Dataset):** Tạo `data/golden_samples.json` (Batch 01 – 8 bài), API `/api/knowledge/samples` & `/api/knowledge/feedback`, và trang Admin `/knowledge`.
- **Giai đoạn C (Brand Writer):** Tách KB, xóa ví dụ giả, nối retrieval 2–4 mẫu, thêm Fact-Check & Editorial Feedback UI vào `/writer`.
- **Giai đoạn D (Creative Director):** Tách Org KB, tạo Resource Inventory (`/api/director/resources`), Event Planning Canvas + 7-Phase Monthly Plan + RACI + KPI (`/api/director/plans`, `/api/ai/director/plan`), luồng duyệt `PROPOSED` → `APPROVED` trong `/director`.
- **Giai đoạn E & F (Security & Evaluation):** Ẩn PII khỏi prompt, kiểm tra phân quyền duyệt, tạo bộ test 20 briefs Writer + 10 scenarios Director.
