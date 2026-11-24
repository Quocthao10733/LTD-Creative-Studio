export interface IdeaCard {
  id: string;
  title: string;
  bigIdea: string;
  format: string; // e.g., "TikTok Short Video (9:16)", "Album Facebook", "Phototrip Ngoại Cảnh"
  targetAudience: string;
  shotlist: string; // Specific shot instructions for Ban Kỹ Thuật
  equipment: string; // Equipment needs (Lens, Tripod, Gimbal, Micro)
  timeline: string;
  feasibility: string; // High, Medium
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: "workshop" | "phototrip" | "facebook_post" | "tiktok_video" | "meeting";
  department: "COMM" | "TECH" | "ALL";
  description?: string;
  status: "scheduled" | "completed" | "in_review";
  createdAt: string;
}
