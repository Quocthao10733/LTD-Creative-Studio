export type ContentPlatform = "facebook" | "tiktok" | "instagram" | "threads" | "website";

export type ContentStatus = "draft" | "in_review" | "approved" | "published";

export interface ContentItem {
  id: string;
  title: string;
  platform: ContentPlatform;
  postType: string;
  tone: string;
  hook: string;
  body: string;
  hashtags: string[];
  visualTips: string;
  factsChecklist: string[];
  status: ContentStatus;
  author: string;
  department: "COMM" | "TECH";
  createdAt: string;
  updatedAt: string;
}

export interface GenerateContentRequest {
  platform: ContentPlatform;
  postType: string;
  tone: string;
  topic: string;
  facts?: string;
  targetAudience?: string;
  lengthPref?: "short" | "medium" | "long";
  creativeAngle?: string;
  recentHooks?: string[];
  model?: string;
}

export interface FactCheckResult {
  unsupported_claims: string[];
  missing_information: string[];
  needs_human_confirmation: boolean;
}

export interface GenerateContentResponse {
  status?: "draft";
  content_type?: string;
  platform?: ContentPlatform;
  headline?: string;
  hook: string;
  body: string;
  cta?: string;
  hashtags: string[];
  visualTips: string;
  factsChecklist: string[];
  fact_check?: FactCheckResult;
  editorial_notes?: string[];
  source_sample_ids?: string[];
  prompt_version?: string;
}
