export const GEMINI_MODEL_STORAGE_KEY = "LTD_GEMINI_MODEL";
const GEMINI_MODEL_CHANGE_EVENT = "ltd-gemini-model-change";

export const GEMINI_MODEL_OPTIONS = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    desc: "Mô hình mới nhất hỗ trợ suy luận tốt, viết tiếng Việt tự nhiên và phân tích brief chính xác.",
    badge: "Khuyên dùng",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    desc: "Mô hình Flash ổn định, tốc độ nhanh, phù hợp đa số tác vụ sáng tạo.",
    badge: "Ổn định",
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash-Lite",
    desc: "Nhanh, tiết kiệm quota, phù hợp nội dung ngắn và fallback khi quá tải.",
    badge: "Tiết kiệm",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    desc: "Mô hình dự phòng tương thích rộng cho mọi API key.",
    badge: "Fallback",
  },
] as const;

export type GeminiModel = (typeof GEMINI_MODEL_OPTIONS)[number]["id"];

export const DEFAULT_GEMINI_MODEL: GeminiModel = "gemini-2.5-flash";

export function isGeminiModel(value: unknown): value is GeminiModel {
  return GEMINI_MODEL_OPTIONS.some((option) => option.id === value);
}

export function getServerDefaultGeminiModel(): GeminiModel {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (isGeminiModel(envModel)) {
    return envModel;
  }
  return DEFAULT_GEMINI_MODEL;
}

export function getStoredGeminiModel(): GeminiModel {
  if (typeof window === "undefined") {
    return DEFAULT_GEMINI_MODEL;
  }

  const savedModel = window.localStorage.getItem(GEMINI_MODEL_STORAGE_KEY);
  return isGeminiModel(savedModel) ? savedModel : DEFAULT_GEMINI_MODEL;
}

export function subscribeToGeminiModel(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(GEMINI_MODEL_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(GEMINI_MODEL_CHANGE_EVENT, onChange);
  };
}

export function saveGeminiModel(model: GeminiModel): void {
  window.localStorage.setItem(GEMINI_MODEL_STORAGE_KEY, model);
  window.dispatchEvent(new Event(GEMINI_MODEL_CHANGE_EVENT));
}

export function resolveGeminiModel(value: unknown): GeminiModel | null {
  if (value === undefined || value === null || value === "") {
    return getServerDefaultGeminiModel();
  }

  return isGeminiModel(value) ? value : null;
}
