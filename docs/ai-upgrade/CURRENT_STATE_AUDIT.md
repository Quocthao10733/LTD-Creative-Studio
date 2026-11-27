# CURRENT STATE AUDIT — LTD CREATIVE STUDIO

**Ngày audit:** 27/11/2026  
**Phạm vi:** AI Content Writer & AI Creative Director trong `LTD Creative Studio`

## 1. Brand Writer (Trước khi nâng cấp)
- **Model/Provider:** `@google/genai` (`^3.6.1`). File `src/lib/ai/models.ts` có sự không khớp giữa `DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite"` và `GEMINI_MODEL_OPTIONS` (`gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-1.5-flash`).
- **API Routes:** `src/app/api/ai/writer/route.ts`, `src/app/api/ai/chat/route.ts`, `src/app/api/content/route.ts`.
- **Prompt & Dữ liệu:** `LTD_FACEBOOK_EXAMPLES` và `EXPERT_COPYWRITING_RULES` bị lặp ở cả `writer/route.ts` và `chat/route.ts`, chứa nhiều nhân vật và sự kiện giả định chưa xác thực.
- **Lưu trữ:** `data/content.json` (đang rỗng) và `localStorage` (`LTD_WRITER_HISTORY`). Chưa có Golden Samples và Editorial Feedback Loop.

## 2. Creative Director (Trước khi nâng cấp)
- **API Routes:** `src/app/api/ai/director/route.ts`, `src/app/api/ideas/route.ts`, `src/app/api/calendar/route.ts`.
- **Dữ liệu:** `LTD_DIRECTOR_EXAMPLES` chứa tên thành viên và thiết bị giả định. Chỉ mới sinh 3 `IdeaCard`, chưa có 7-phase Monthly Operating System, Event Canvas, WBS/RACI, Resource Inventory, KPI (Target/Estimate/Actual) và luồng phê duyệt `PROPOSED` → `APPROVED`.
