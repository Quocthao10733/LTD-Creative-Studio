# PROPOSED ARCHITECTURE — LTD AI UPGRADE

## 1. Nguyên tắc kiến trúc
- Giữ nguyên Gemini provider (`@google/genai`), hỗ trợ cấu hình model qua `process.env.GEMINI_MODEL` (mặc định `gemini-2.5-flash`, fallback `gemini-2.0-flash` → `gemini-2.0-flash-lite`).
- Tách riêng hoàn toàn 2 Knowledge Base:
  - `src/lib/ai/knowledge/writer/`: `brand-knowledge.ts`, `samples-store.ts` (Golden Samples + Editorial Feedback).
  - `src/lib/ai/knowledge/director/`: `org-knowledge.ts` (đọc từ `data/members.json` đã ẩn PII + `data/resource_inventory.json`).
- Lưu trữ Hybrid: File JSON trong `data/` (`golden_samples.json`, `editorial_feedback.json`, `resource_inventory.json`, `director_plans.json`) tương thích với các file hiện tại và fallback an toàn trên serverless.
