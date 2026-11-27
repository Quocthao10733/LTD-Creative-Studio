export type QualityTier = "A" | "B" | "C" | "REJECTED" | null;

export type SampleApprovalStatus =
  | "UNREVIEWED_CANDIDATE"
  | "APPROVED_SAMPLE"
  | "NEEDS_EDIT"
  | "REJECTED";

export type DatasetStatus = "INITIAL_BATCH" | "BUILDING" | "READY";

export interface GoldenSampleCredits {
  content: string | null;
  design: string | null;
}

export interface GoldenSample {
  sample_id: string;
  batch_id: string;
  title: string;
  platform: "facebook" | "tiktok" | "instagram" | "threads" | "website";
  category: string;
  category_label: string;
  style_labels: string[];
  observed_style_notes: string;
  original_text: string;
  visual_context?: string;
  confirmed_facts?: string[];
  credits: GoldenSampleCredits;
  source_page: string;
  source_type: "user_supplied_fanpage_post" | "manual_admin_entry" | "approved_ai_output";
  source_url: string | null;
  published_at: string | null;
  engagement_metrics: Record<string, number> | null;
  contact_footer: string;
  approval_status: SampleApprovalStatus;
  quality_tier: QualityTier;
  approved_for_retrieval: boolean;
  rights_confirmed: boolean;
  contains_pii: boolean;
  review_notes: string;
  reviewed_by_role?: string;
  created_at: string;
  updated_at: string;
}

export interface GoldenDatasetMeta {
  dataset_status: DatasetStatus;
  sample_count: number;
  target_min: number;
  target_max: number;
  source_page: string;
  last_updated: string;
}

export interface GoldenDatasetFile {
  dataset_meta: GoldenDatasetMeta;
  samples: GoldenSample[];
}

export type EditorialEditType =
  | "remove_cliche"
  | "add_verified_detail"
  | "change_hook"
  | "shorten_sentence"
  | "tone_adjustment"
  | "fix_factual_error";

export interface EditorialFeedback {
  feedback_id: string;
  generation_id: string;
  prompt_version: string;
  model_id: string;
  sample_id?: string | null;
  retrieved_sample_ids: string[];
  ai_draft: string;
  human_final: string;
  edit_types: EditorialEditType[];
  reason_for_edits: string;
  review_rating: number;
  approved_as_golden_sample: boolean;
  reviewer_role: string;
  created_at: string;
}
