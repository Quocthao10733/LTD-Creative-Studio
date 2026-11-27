import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DirectorPlanCanvas, EventApprovalStatus } from "@/lib/types/director";

const DATA_DIR = path.join(process.cwd(), "data");
const PLANS_FILE = path.join(DATA_DIR, "director_plans.json");

let memoryPlans: DirectorPlanCanvas[] | null = null;

function readPlans(): DirectorPlanCanvas[] {
  if (memoryPlans) return memoryPlans;
  try {
    if (fs.existsSync(PLANS_FILE)) {
      const raw = fs.readFileSync(PLANS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryPlans = parsed;
        return parsed;
      }
    }
  } catch {}
  memoryPlans = [];
  return memoryPlans;
}

function savePlans(items: DirectorPlanCanvas[]) {
  memoryPlans = items;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(PLANS_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch {}
}

export async function GET() {
  const items = readPlans();
  return NextResponse.json({ success: true, data: items, total: items.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const plans = readPlans();
    const now = new Date().toISOString();

    const newPlan: DirectorPlanCanvas = {
      ...body,
      planId: body.planId || `PLAN-${Date.now()}`,
      approvalStatus: "PROPOSED", // Always force PROPOSED on creation
      exportedToCalendar: false,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newPlan, ...plans];
    savePlans(updated);

    return NextResponse.json({ success: true, data: newPlan });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Lỗi lưu kế hoạch" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, approvalStatus, approverRole, retrospectiveNotes, lessonsLearned, kpis, exportedToCalendar } = body;

    if (!planId) {
      return NextResponse.json({ success: false, error: "Thiếu planId" }, { status: 400 });
    }

    const plans = readPlans();
    const idx = plans.findIndex((p) => p.planId === planId);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy kế hoạch" }, { status: 404 });
    }

    const current = plans[idx];
    const allowedApproverRoles = ["Chủ tịch CLB", "Phó Chủ Tịch", "Trưởng Ban", "Admin", "Ban Điều hành"];
    if (approvalStatus === "APPROVED" && !allowedApproverRoles.some((r) => String(approverRole || "").includes(r))) {
      return NextResponse.json(
        {
          success: false,
          error: "Chỉ Ban Điều hành / Trưởng Ban mới có quyền phê duyệt (APPROVED) kế hoạch!",
        },
        { status: 403 }
      );
    }

    const nextStatus: EventApprovalStatus = approvalStatus || current.approvalStatus;
    plans[idx] = {
      ...current,
      approvalStatus: nextStatus,
      approvedByRole: nextStatus === "APPROVED" ? approverRole : current.approvedByRole,
      approvedAt: nextStatus === "APPROVED" ? new Date().toISOString() : current.approvedAt,
      retrospectiveNotes: retrospectiveNotes !== undefined ? retrospectiveNotes : current.retrospectiveNotes,
      lessonsLearned: Array.isArray(lessonsLearned) ? lessonsLearned : current.lessonsLearned,
      kpis: Array.isArray(kpis) ? kpis : current.kpis,
      exportedToCalendar: exportedToCalendar !== undefined ? Boolean(exportedToCalendar) : current.exportedToCalendar,
      updatedAt: new Date().toISOString(),
    };

    savePlans(plans);
    return NextResponse.json({ success: true, data: plans[idx] });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Lỗi cập nhật kế hoạch" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID kế hoạch" }, { status: 400 });
    }
    const plans = readPlans().filter((p) => p.planId !== id);
    savePlans(plans);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Lỗi xóa kế hoạch" },
      { status: 500 }
    );
  }
}
