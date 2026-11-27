import { NextRequest, NextResponse } from "next/server";
import {
  readEditorialFeedback,
  saveEditorialFeedback,
} from "@/lib/ai/knowledge/writer/samples-store";
import { EditorialFeedback } from "@/lib/types/knowledge";

export async function GET() {
  const items = readEditorialFeedback();
  return NextResponse.json({
    success: true,
    data: items,
    total: items.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = readEditorialFeedback();

    const newItem: EditorialFeedback = {
      feedback_id: `FB-${Date.now()}`,
      generation_id: String(body.generation_id || `GEN-${Date.now()}`),
      prompt_version: String(body.prompt_version || "writer-v2.0.0"),
      model_id: String(body.model_id || "unknown"),
      sample_id: body.sample_id || null,
      retrieved_sample_ids: Array.isArray(body.retrieved_sample_ids) ? body.retrieved_sample_ids : [],
      ai_draft: String(body.ai_draft || ""),
      human_final: String(body.human_final || ""),
      edit_types: Array.isArray(body.edit_types) ? body.edit_types : [],
      reason_for_edits: String(body.reason_for_edits || ""),
      review_rating: Math.min(5, Math.max(1, Number(body.review_rating || 4))),
      approved_as_golden_sample: Boolean(body.approved_as_golden_sample),
      reviewer_role: String(body.reviewer_role || "content_editor"),
      created_at: new Date().toISOString(),
    };

    const updated = [newItem, ...items];
    saveEditorialFeedback(updated);

    return NextResponse.json({
      success: true,
      message: "Đã lưu Editorial Feedback vào hệ thống đánh giá.",
      data: newItem,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Lỗi lưu Editorial Feedback",
      },
      { status: 500 }
    );
  }
}
