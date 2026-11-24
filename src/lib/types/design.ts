export type LayerType = "text" | "image" | "shape" | "badge" | "watermark";

export interface CanvasLayer {
  id: string;
  type: LayerType;
  name: string;
  x: number; // percentage (0 - 100) or pixels
  y: number; // percentage (0 - 100) or pixels
  width: number;
  height: number;
  rotation?: number; // degrees 0 - 360
  opacity?: number; // 0 - 1
  zIndex: number;
  locked?: boolean;

  // Text attributes
  text?: string;
  fontSize?: number; // px at standard scale
  fontFamily?: string;
  fontWeight?: "normal" | "500" | "600" | "bold" | "900" | string;
  fontStyle?: "normal" | "italic";
  color?: string;
  textAlign?: "left" | "center" | "right";
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: "uppercase" | "none" | "capitalize";

  // Image attributes
  imageUrl?: string;
  imageFit?: "cover" | "contain";
  borderRadius?: number;
  filter?: string; // grayscale, sepia, blur, brightness

  // Shape / Badge attributes
  shapeType?: "rectangle" | "rounded-rect" | "circle" | "badge-pill" | "watermark-aperture";
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  gradient?: string;
  iconName?: string;
}

export type PresetRatioId = "fb-square" | "fb-portrait" | "event-cover" | "story-tiktok";

export interface CanvasPreset {
  id: PresetRatioId;
  name: string;
  platform: string;
  width: number; // reference canvas resolution
  height: number;
  aspectRatio: string;
  description: string;
}

export const CANVAS_PRESETS: Record<PresetRatioId, CanvasPreset> = {
  "fb-square": {
    id: "fb-square",
    name: "Facebook / Insta Vuông",
    platform: "Facebook / Instagram Post",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    description: "Chuẩn bài đăng feed Facebook & Instagram phổ biến nhất",
  },
  "fb-portrait": {
    id: "fb-portrait",
    name: "Facebook Dọc (Tối ưu Mobile)",
    platform: "Facebook Feed 4:5",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    description: "Hiển thị tối đa không gian màn hình điện thoại khi lướt feed",
  },
  "event-cover": {
    id: "event-cover",
    name: "Banner Sự Kiện & Cover",
    platform: "Facebook Event / Group Cover",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    description: "Banner trang chủ, ảnh bìa sự kiện workshop hoặc bài thuyết trình",
  },
  "story-tiktok": {
    id: "story-tiktok",
    name: "Story / TikTok Poster",
    platform: "Story & TikTok 9:16",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    description: "Poster dạng đứng cho Story Facebook, Instagram Reels và TikTok",
  },
};

export interface PosterProject {
  id: string;
  title: string;
  presetId: PresetRatioId;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  layers: CanvasLayer[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface AutoLayoutRequest {
  topic: string;
  presetId: PresetRatioId;
  eventType?: "workshop" | "phototrip" | "recruitment" | "contest" | "general";
  speakerOrHost?: string;
  dateStr?: string;
  timeStr?: string;
  locationStr?: string;
  callToAction?: string;
  apiKey?: string;
}

export interface AutoLayoutResponse {
  success: boolean;
  title: string;
  backgroundColor: string;
  backgroundImagePrompt?: string;
  suggestedStockBg?: string;
  layers: CanvasLayer[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    textDark: string;
    textLight: string;
  };
  tipsForDesigner?: string[];
}

export interface CanvaTemplateItem {
  id: string;
  title: string;
  category: "workshop" | "phototrip" | "recruitment" | "contest" | "cover";
  ratioId: PresetRatioId;
  canvaTemplateUrl: string;
  previewImage: string;
  badge: string;
  description: string;
}

export interface CanvaCustomClubLink {
  id: string;
  title: string;
  url: string;
  category: string;
  author: string;
  updatedAt: string;
}

export interface CanvaSyncPayload {
  title: string;
  canvaUrl: string;
  imageUrl?: string;
  category: string;
  department: "COMM" | "TECH" | "ALL";
  scheduleDate?: string;
  scheduleTime?: string;
}

