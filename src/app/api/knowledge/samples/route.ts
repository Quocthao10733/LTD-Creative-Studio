import { NextRequest, NextResponse } from "next/server";
import {
  parseBatchSamples,
  readGoldenDataset,
  saveGoldenDataset,
} from "@/lib/ai/knowledge/writer/samples-store";
import { QualityTier, SampleApprovalStatus } from "@/lib/types/knowledge";

export async function GET(request: NextRequest) {
  const dataset = readGoldenDataset();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const tier = searchParams.get("tier");
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.toLowerCase();

  let filtered = dataset.samples;
  if (category && category !== "all") {
    filtered = filtered.filter((s) => s.category === category);
  }
  if (tier && tier !== "all") {
    filtered = filtered.filter((s) => (tier === "unreviewed" ? s.quality_tier === null : s.quality_tier === tier));
  }
  if (status && status !== "all") {
    filtered = filtered.filter((s) => s.approval_status === status);
  }
  if (q) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.original_text.toLowerCase().includes(q) ||
        s.sample_id.toLowerCase().includes(q) ||
        s.style_labels.some((l) => l.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({
    success: true,
    dataset_meta: dataset.dataset_meta,
    data: filtered,
    total: filtered.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      format = "text",
      rawContent,
      batchId,
      title,
      category,
      category_label,
      platform,
      style_labels,
      observed_style_notes,
      source_url,
    } = body;

    if (!rawContent || typeof rawContent !== "string" || !rawContent.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập nội dung bài mẫu để import!" },
        { status: 400 }
      );
    }

    const dataset = readGoldenDataset();
    const existingIds = new Set(dataset.samples.map((s) => s.sample_id));

    const { parsed, errors } = parseBatchSamples({
      format,
      rawContent,
      batchId: batchId || `BATCH_${new Date().toISOString().slice(0, 10)}`,
      existingIds,
    });

    if (parsed.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: errors.join(" | ") || "Không thể trích xuất bài mẫu hợp lệ.",
          errors,
        },
        { status: 400 }
      );
    }

    // Apply optional overrides for single manual text import
    if (format === "text" && parsed.length === 1) {
      if (title) parsed[0].title = String(title).trim();
      if (category) parsed[0].category = String(category).trim();
      if (category_label) parsed[0].category_label = String(category_label).trim();
      if (platform) parsed[0].platform = platform;
      if (Array.isArray(style_labels)) parsed[0].style_labels = style_labels;
      if (observed_style_notes) parsed[0].observed_style_notes = String(observed_style_notes).trim();
      if (source_url) parsed[0].source_url = String(source_url).trim();
    }

    const updatedSamples = [...dataset.samples, ...parsed];
    const saved = saveGoldenDataset(updatedSamples);

    return NextResponse.json({
      success: true,
      imported_count: parsed.length,
      imported_ids: parsed.map((p) => p.sample_id),
      errors,
      dataset_meta: saved.dataset_meta,
      data: parsed,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Lỗi import Golden Samples",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sample_id,
      title,
      category,
      category_label,
      style_labels,
      observed_style_notes,
      quality_tier,
      approval_status,
      approved_for_retrieval,
      review_notes,
      reviewed_by_role,
    } = body;

    if (!sample_id) {
      return NextResponse.json({ success: false, error: "Thiếu sample_id" }, { status: 400 });
    }

    const dataset = readGoldenDataset();
    const index = dataset.samples.findIndex((s) => s.sample_id === sample_id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy bài mẫu" }, { status: 404 });
    }

    const current = dataset.samples[index];
    const nextTier: QualityTier = quality_tier !== undefined ? quality_tier : current.quality_tier;
    const nextStatus: SampleApprovalStatus =
      approval_status !== undefined ? approval_status : current.approval_status;

    const autoRetrieval =
      nextTier === "C" || nextTier === "REJECTED" || nextStatus === "REJECTED"
        ? false
        : approved_for_retrieval !== undefined
          ? Boolean(approved_for_retrieval)
          : current.approved_for_retrieval;

    dataset.samples[index] = {
      ...current,
      title: title !== undefined ? String(title).trim() : current.title,
      category: category !== undefined ? String(category).trim() : current.category,
      category_label: category_label !== undefined ? String(category_label).trim() : current.category_label,
      style_labels: Array.isArray(style_labels) ? style_labels : current.style_labels,
      observed_style_notes:
        observed_style_notes !== undefined ? String(observed_style_notes).trim() : current.observed_style_notes,
      quality_tier: nextTier,
      approval_status: nextStatus,
      approved_for_retrieval: autoRetrieval,
      review_notes: review_notes !== undefined ? String(review_notes) : current.review_notes,
      reviewed_by_role: reviewed_by_role || current.reviewed_by_role,
      updated_at: new Date().toISOString(),
    };

    const saved = saveGoldenDataset(dataset.samples);

    return NextResponse.json({
      success: true,
      dataset_meta: saved.dataset_meta,
      data: dataset.samples[index],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Lỗi cập nhật bài mẫu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID bài mẫu" }, { status: 400 });
    }

    const dataset = readGoldenDataset();
    const filtered = dataset.samples.filter((s) => s.sample_id !== id);
    const saved = saveGoldenDataset(filtered);

    return NextResponse.json({
      success: true,
      dataset_meta: saved.dataset_meta,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Lỗi xóa bài mẫu" },
      { status: 500 }
    );
  }
}
