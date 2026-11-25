export const GEMINI_MODEL_STORAGE_KEY = "LTD_GEMINI_MODEL";
const GEMINI_MODEL_CHANGE_EVENT = "ltd-gemini-model-change";

export const GEMINI_MODEL_OPTIONS = [
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    desc: "Mô hình Flash ổn định hiện tại, phù hợp viết và xử lý nội dung.",
    badge: "Khuyên dùng",
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash-Lite",
    desc: "Nhanh và tiết kiệm cho nội dung ngắn, tác vụ thường ngày.",
    badge: "Tiết kiệm",
  },
] as const;

export type GeminiModel = (typeof GEMINI_MODEL_OPTIONS)[number]["id"];

export const DEFAULT_GEMINI_MODEL: GeminiModel = "gemini-3.8-flash";

export function isGeminiModel(value: unknown): value is GeminiModel {
  return GEMINI_MODEL_OPTIONS.some((option) => option.id === value);
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
    return DEFAULT_GEMINI_MODEL;
  }

  return isGeminiModel(value) ? value : null;
}
