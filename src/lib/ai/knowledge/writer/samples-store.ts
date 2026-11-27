import fs from "fs";
import path from "path";
import {
  DatasetStatus,
  EditorialFeedback,
  GoldenDatasetFile,
  GoldenDatasetMeta,
  GoldenSample,
  QualityTier,
} from "@/lib/types/knowledge";

const DATA_DIR = path.join(process.cwd(), "data");
const SAMPLES_FILE = path.join(DATA_DIR, "golden_samples.json");
const FEEDBACK_FILE = path.join(DATA_DIR, "editorial_feedback.json");

let memoryDataset: GoldenDatasetFile | null = null;
let memoryFeedback: EditorialFeedback[] | null = null;

function computeDatasetStatus(count: number): DatasetStatus {
  if (count >= 20) return "READY";
  if (count > 8) return "BUILDING";
  return "INITIAL_BATCH";
}

function emptyDataset(): GoldenDatasetFile {
  return {
    dataset_meta: {
      dataset_status: "INITIAL_BATCH",
      sample_count: 0,
      target_min: 20,
      target_max: 30,
      source_page: "LTD - Long Thành Digital Photo Club",
      last_updated: new Date().toISOString(),
    },
    samples: [],
  };
}

export function readGoldenDataset(): GoldenDatasetFile {
  if (memoryDataset) {
    return memoryDataset;
  }

  try {
    if (fs.existsSync(SAMPLES_FILE)) {
      const raw = fs.readFileSync(SAMPLES_FILE, "utf-8");
      const parsed = JSON.parse(raw) as GoldenDatasetFile;
      if (parsed && Array.isArray(parsed.samples)) {
        const syncedMeta: GoldenDatasetMeta = {
          dataset_status: computeDatasetStatus(parsed.samples.length),
          sample_count: parsed.samples.length,
          target_min: parsed.dataset_meta?.target_min || 20,
          target_max: parsed.dataset_meta?.target_max || 30,
          source_page: parsed.dataset_meta?.source_page || "LTD - Long Thành Digital Photo Club",
          last_updated: parsed.dataset_meta?.last_updated || new Date().toISOString(),
        };
        memoryDataset = { dataset_meta: syncedMeta, samples: parsed.samples };
        return memoryDataset;
      }
    }
  } catch (err) {
    console.warn("Không thể đọc data/golden_samples.json:", err);
  }

  memoryDataset = emptyDataset();
  return memoryDataset;
}

export function saveGoldenDataset(samples: GoldenSample[]): GoldenDatasetFile {
  const updated: GoldenDatasetFile = {
    dataset_meta: {
      dataset_status: computeDatasetStatus(samples.length),
      sample_count: samples.length,
      target_min: 20,
      target_max: 30,
      source_page: "LTD - Long Thành Digital Photo Club",
      last_updated: new Date().toISOString(),
    },
    samples,
  };

  memoryDataset = updated;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SAMPLES_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch {
    // Fallback gracefully on read-only serverless environments (e.g., Vercel)
  }

  return updated;
}

/**
 * Strip accidental emails or phone numbers before sending samples into AI prompt context.
 */
export function stripPII(text: string): string {
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email đã ẩn]")
    .replace(/(?:\+84|0)(?:\d[\s.-]?){8,10}\d/g, "[số điện thoại đã ẩn]");
}

const POST_TYPE_TO_CATEGORIES: Record<string, string[]> = {
  workshop_recap: ["event_recap", "event_coverage", "workshop_education"],
  event_recap: ["event_recap", "event_coverage"],
  photo_caption: ["photo_story", "event_coverage", "photo_concept"],
  photo_story: ["photo_story"],
  member_recruitment: ["recruitment", "member_welcome"],
  recruitment: ["recruitment", "member_welcome"],
  member_welcome: ["member_welcome", "recruitment"],
  gear_review: ["photography_tip", "workshop_education"],
  photography_tip: ["photography_tip", "workshop_education"],
  storytelling: ["photo_story", "member_welcome", "event_recap"],
};

const TONE_TO_STYLE_HINTS: Record<string, string[]> = {
  artistic: ["cinematic_emotional_recap", "nostalgic_storytelling", "photography_metaphor"],
  youthful: ["energetic_youthful", "motivational_youthful", "youthful_encouragement"],
  inspirational: ["warm_community_voice", "member_journey", "tribute"],
  conversational: ["warm_community_voice", "community_building", "dialogue_hook"],
  formal: ["event_recap", "tribute"],
  technical: ["workshop_education", "photography_tip"],
};

function tierWeight(tier: QualityTier, approvalStatus: string): number {
  if (tier === "A") return 100;
  if (tier === "B") return 60;
  if (approvalStatus === "UNREVIEWED_CANDIDATE" && tier === null) return 30;
  return -1000; // Exclude Tier C & REJECTED from positive retrieval
}

export interface RetrievalQuery {
  platform?: string;
  postType?: string;
  tone?: string;
  topic?: string;
  limit?: number;
}

/**
 * Retrieve top 2-4 most relevant Golden Samples (never stuffing entire dataset into prompt).
 * Respects Tier ranking (A > B > UNREVIEWED_CANDIDATE), excludes Tier C & Rejected.
 */
export function retrieveRelevantSamples(query: RetrievalQuery): {
  samples: GoldenSample[];
  datasetMeta: GoldenDatasetMeta;
} {
  const dataset = readGoldenDataset();
  const limit = Math.min(Math.max(query.limit ?? 3, 1), 4);
  const targetCategories = query.postType ? POST_TYPE_TO_CATEGORIES[query.postType] || [query.postType] : [];
  const toneHints = query.tone ? TONE_TO_STYLE_HINTS[query.tone] || [] : [];
  const topicTokens = (query.topic || "")
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  const eligible = dataset.samples.filter(
    (s) =>
      s.approved_for_retrieval !== false &&
      s.rights_confirmed !== false &&
      s.quality_tier !== "C" &&
      s.quality_tier !== "REJECTED" &&
      s.approval_status !== "REJECTED"
  );

  const scored = eligible.map((sample) => {
    let score = tierWeight(sample.quality_tier, sample.approval_status);

    if (query.platform && sample.platform === query.platform) {
      score += 20;
    }

    if (targetCategories.includes(sample.category)) {
      score += 35;
    }

    const labelMatches = sample.style_labels.filter((l) => toneHints.includes(l)).length;
    score += labelMatches * 12;

    if (topicTokens.length > 0) {
      const haystack = `${sample.title} ${sample.category_label} ${sample.style_labels.join(" ")}`.toLowerCase();
      const keywordHits = topicTokens.filter((tok) => haystack.includes(tok)).length;
      score += Math.min(keywordHits * 6, 24);
    }

    return { sample, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return {
    samples: scored.slice(0, limit).map((item) => item.sample),
    datasetMeta: dataset.dataset_meta,
  };
}

export function formatRetrievedSamplesForPrompt(samples: GoldenSample[], meta: GoldenDatasetMeta): string {
  if (samples.length === 0) {
    return "Hiện chưa có bài mẫu phù hợp trong kho Golden Samples. Hãy tuân thủ chặt chẽ dữ kiện người dùng cung cấp và không bịa đặt.";
  }

  const header = `=== MẪU THAM KHẢO PHONG CÁCH LTD (${samples.length} mẫu truy xuất từ kho ${meta.dataset_status}, tổng ${meta.sample_count} bài) ===
LƯU Ý: Chỉ học cách tổ chức cấu trúc, nhịp kể và cách dùng từ. KHÔNG sao chép nguyên câu hay lấy nhân vật/sự kiện trong mẫu đưa vào bài mới.\n`;

  const blocks = samples.map((s, idx) => {
    const cleanText = stripPII(s.original_text);
    return `--- MẪU ${idx + 1} [${s.sample_id}] (${s.category_label} | ${s.approval_status}${s.quality_tier ? ` | Tier ${s.quality_tier}` : ""}) ---
Dấu hiệu phong cách: ${s.observed_style_notes}
Nhãn: ${s.style_labels.join(", ")}
Nội dung tham khảo:
${cleanText}`;
  });

  return `${header}\n${blocks.join("\n\n")}`;
}

/**
 * Parse Batch Import from Markdown (# POST XXX ... ## NỘI DUNG GỐC ...), JSON, CSV, or plain text.
 */
export function parseBatchSamples(params: {
  format: "markdown" | "json" | "csv" | "text";
  rawContent: string;
  batchId?: string;
  existingIds?: Set<string>;
}): { parsed: GoldenSample[]; errors: string[] } {
  const { format, rawContent, batchId = `BATCH_${Date.now()}`, existingIds = new Set() } = params;
  const parsed: GoldenSample[] = [];
  const errors: string[] = [];
  const now = new Date().toISOString();

  const makeNextId = (indexOffset: number) => {
    let seq = existingIds.size + indexOffset + 1;
    let candidate = `LTD-POST-${String(seq).padStart(3, "0")}`;
    while (existingIds.has(candidate)) {
      seq += 1;
      candidate = `LTD-POST-${String(seq).padStart(3, "0")}`;
    }
    existingIds.add(candidate);
    return candidate;
  };

  if (format === "json") {
    try {
      const data = JSON.parse(rawContent);
      const list = Array.isArray(data) ? data : Array.isArray(data.samples) ? data.samples : [data];
      list.forEach((item: Record<string, unknown>, idx: number) => {
        const text = String(item.original_text || "").trim();
        if (!text) {
          errors.push(`JSON item #${idx + 1}: thiếu original_text.`);
          return;
        }
        const rawId = typeof item.sample_id === "string" && item.sample_id.trim() ? item.sample_id.trim() : "";
        const sampleId = rawId && !existingIds.has(rawId) ? (existingIds.add(rawId), rawId) : makeNextId(idx);

        parsed.push({
          sample_id: sampleId,
          batch_id: String(item.batch_id || batchId),
          title: String(item.title || text.split("\n")[0].slice(0, 80)),
          platform: (item.platform as GoldenSample["platform"]) || "facebook",
          category: String(item.category || "event_recap"),
          category_label: String(item.category_label || item.category || "Fanpage Post"),
          style_labels: Array.isArray(item.style_labels) ? item.style_labels.map(String) : [],
          observed_style_notes: String(item.observed_style_notes || ""),
          original_text: text,
          credits: {
            content: (item.credits as { content?: string | null })?.content ?? null,
            design: (item.credits as { design?: string | null })?.design ?? null,
          },
          source_page: String(item.source_page || "LTD - Long Thành Digital Photo Club"),
          source_type: "user_supplied_fanpage_post",
          source_url: typeof item.source_url === "string" ? item.source_url : null,
          published_at: typeof item.published_at === "string" ? item.published_at : null,
          engagement_metrics: null,
          contact_footer: "redacted_from_training_copy",
          approval_status: "UNREVIEWED_CANDIDATE",
          quality_tier: null,
          approved_for_retrieval: true,
          rights_confirmed: true,
          contains_pii: false,
          review_notes: String(item.review_notes || "Imported via JSON batch – chưa chấm Tier."),
          created_at: now,
          updated_at: now,
        });
      });
    } catch (e: unknown) {
      errors.push(`Lỗi parse JSON: ${e instanceof Error ? e.message : "Invalid JSON"}`);
    }
    return { parsed, errors };
  }

  if (format === "markdown") {
    const sections = rawContent.split(/(?=^#\s+POST\s+\d+)/m).filter((s) => /##\s+NỘI DUNG GỐC/i.test(s));
    if (sections.length === 0) {
      errors.push("Không tìm thấy block '# POST ...' kèm '## NỘI DUNG GỐC' trong nội dung Markdown.");
      return { parsed, errors };
    }

    sections.forEach((sec, idx) => {
      const titleMatch = sec.match(/^#\s+POST\s+\d+\s*[—–-]\s*(.+)$/m);
      const idMatch = sec.match(/\*\*ID:\*\*\s*`?([A-Za-z0-9_-]+)`?/i);
      const groupMatch = sec.match(/\*\*Nhóm nội dung:\*\*\s*(.+)$/m);
      const styleNoteMatch = sec.match(/\*\*Dấu hiệu phong cách quan sát được:\*\*\s*(.+)$/m);
      const tagsMatch = sec.match(/\*\*Nhãn học:\*\*\s*(.+)$/m);
      const contentMatch = sec.match(/##\s+NỘI DUNG GỐC\s*\r?\n([\s\S]*?)(?:\r?\n---|\r?\n#\s+|$)/i);

      const originalText = contentMatch ? contentMatch[1].replace(/\[Footer thông tin liên hệ[^\]]*\]/gi, "").trim() : "";
      if (!originalText) {
        errors.push(`Section #${idx + 1}: không trích xuất được nội dung gốc.`);
        return;
      }

      const rawId = idMatch ? idMatch[1].trim() : "";
      const sampleId = rawId && !existingIds.has(rawId) ? (existingIds.add(rawId), rawId) : makeNextId(idx);
      const tags = tagsMatch
        ? tagsMatch[1]
            .split(",")
            .map((t) => t.replace(/`/g, "").trim())
            .filter(Boolean)
        : [];

      parsed.push({
        sample_id: sampleId,
        batch_id: batchId,
        title: titleMatch ? titleMatch[1].trim() : originalText.split("\n")[0].slice(0, 80),
        platform: "facebook",
        category: tags[0] || "event_recap",
        category_label: groupMatch ? groupMatch[1].trim() : "Fanpage Post",
        style_labels: tags,
        observed_style_notes: styleNoteMatch ? styleNoteMatch[1].trim() : "",
        original_text: originalText,
        credits: { content: null, design: null },
        source_page: "LTD - Long Thành Digital Photo Club",
        source_type: "user_supplied_fanpage_post",
        source_url: null,
        published_at: null,
        engagement_metrics: null,
        contact_footer: "redacted_from_training_copy",
        approval_status: "UNREVIEWED_CANDIDATE",
        quality_tier: null,
        approved_for_retrieval: true,
        rights_confirmed: true,
        contains_pii: false,
        review_notes: "Imported via Markdown batch – chưa chấm Tier.",
        created_at: now,
        updated_at: now,
      });
    });
    return { parsed, errors };
  }

  if (format === "csv") {
    const lines = rawContent.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      errors.push("CSV cần ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu.");
      return { parsed, errors };
    }
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = cols[idx] || "";
      });
      const text = row.original_text || row.content || row.caption || "";
      if (!text) {
        errors.push(`CSV dòng ${i + 1}: thiếu cột original_text/content.`);
        continue;
      }
      const sampleId = makeNextId(i - 1);
      parsed.push({
        sample_id: sampleId,
        batch_id: batchId,
        title: row.title || text.slice(0, 80),
        platform: (row.platform as GoldenSample["platform"]) || "facebook",
        category: row.category || "event_recap",
        category_label: row.category_label || row.category || "Fanpage Post",
        style_labels: row.style_labels ? row.style_labels.split(";").map((s) => s.trim()).filter(Boolean) : [],
        observed_style_notes: row.observed_style_notes || "",
        original_text: text,
        credits: { content: row.author || null, design: null },
        source_page: "LTD - Long Thành Digital Photo Club",
        source_type: "user_supplied_fanpage_post",
        source_url: row.source_url || null,
        published_at: null,
        engagement_metrics: null,
        contact_footer: "redacted_from_training_copy",
        approval_status: "UNREVIEWED_CANDIDATE",
        quality_tier: null,
        approved_for_retrieval: true,
        rights_confirmed: true,
        contains_pii: false,
        review_notes: "Imported via CSV batch – chưa chấm Tier.",
        created_at: now,
        updated_at: now,
      });
    }
    return { parsed, errors };
  }

  // Plain text single post paste
  const trimmed = rawContent.trim();
  if (!trimmed) {
    errors.push("Nội dung bài viết không được để trống.");
    return { parsed, errors };
  }
  const sampleId = makeNextId(0);
  parsed.push({
    sample_id: sampleId,
    batch_id: batchId,
    title: trimmed.split("\n")[0].slice(0, 80),
    platform: "facebook",
    category: "event_recap",
    category_label: "Fanpage Post (Manual Paste)",
    style_labels: [],
    observed_style_notes: "",
    original_text: trimmed,
    credits: { content: null, design: null },
    source_page: "LTD - Long Thành Digital Photo Club",
    source_type: "manual_admin_entry",
    source_url: null,
    published_at: null,
    engagement_metrics: null,
    contact_footer: "redacted_from_training_copy",
    approval_status: "UNREVIEWED_CANDIDATE",
    quality_tier: null,
    approved_for_retrieval: true,
    rights_confirmed: true,
    contains_pii: false,
    review_notes: "Nhập thủ công – chưa chấm Tier.",
    created_at: now,
    updated_at: now,
  });
  return { parsed, errors };
}

// =========================================================================
// EDITORIAL FEEDBACK STORE
// =========================================================================

export function readEditorialFeedback(): EditorialFeedback[] {
  if (memoryFeedback) return memoryFeedback;
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      const raw = fs.readFileSync(FEEDBACK_FILE, "utf-8");
      const parsed = JSON.parse(raw) as EditorialFeedback[];
      if (Array.isArray(parsed)) {
        memoryFeedback = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Không thể đọc editorial_feedback.json:", err);
  }
  memoryFeedback = [];
  return memoryFeedback;
}

export function saveEditorialFeedback(items: EditorialFeedback[]): void {
  memoryFeedback = items;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch {
    // Graceful serverless fallback
  }
}
