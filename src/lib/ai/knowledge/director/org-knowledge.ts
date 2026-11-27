import fs from "fs";
import path from "path";
import { DEPARTMENTS, Member } from "@/lib/types/member";

export const DIRECTOR_PROMPT_VERSION = "director-v2.0.0";

const MEMBERS_FILE = path.join(process.cwd(), "data", "members.json");
const RESOURCES_FILE = path.join(process.cwd(), "data", "resource_inventory.json");

export interface ResourceItem {
  id: string;
  name: string;
  category: "camera" | "lens" | "lighting" | "venue" | "software" | "budget" | "instructor";
  status: "Available" | "Limited" | "Unavailable" | "Needs confirmation";
  notes?: string;
}

export function readResourceInventory(): ResourceItem[] {
  try {
    if (fs.existsSync(RESOURCES_FILE)) {
      const raw = fs.readFileSync(RESOURCES_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Load ONLY verified organization facts from local database (members.json + DEPARTMENTS).
 * Strips PII (email, phone) before passing to Gemini prompt.
 */
export function loadDirectorOrganizationContext(): string {
  const deptLines = Object.values(DEPARTMENTS).map(
    (d) => `- ${d.name} (${d.code}): ${d.description}`
  );

  let membersSummary = "Chưa có danh sách thành viên xác nhận trong database.";
  try {
    if (fs.existsSync(MEMBERS_FILE)) {
      const raw = fs.readFileSync(MEMBERS_FILE, "utf-8");
      const members = JSON.parse(raw) as Member[];
      if (Array.isArray(members) && members.length > 0) {
        const active = members.filter((m) => m.status === "active");
        const lines = active.map((m) => {
          const skills = m.skills && m.skills.length > 0 ? ` | Kỹ năng: ${m.skills.join(", ")}` : "";
          const equip = m.equipment ? ` | Thiết bị cá nhân khai báo: ${m.equipment}` : "";
          return `  * ${m.name} — ${m.role} (${m.department})${skills}${equip}`;
        });
        membersSummary = `Danh sách ${active.length} thành viên active đã xác nhận (không kèm PII):\n${lines.join("\n")}`;
      }
    }
  } catch {}

  const resources = readResourceInventory();
  const resourceSummary =
    resources.length > 0
      ? resources
          .map((r) => `  * [${r.status}] ${r.name} (${r.category})${r.notes ? ` — ${r.notes}` : ""}`)
          .join("\n")
      : "Chưa có dữ liệu kho thiết bị/ngân sách/địa điểm xác nhận (Resource Inventory trống — mọi thiết bị, địa điểm, ngân sách đề xuất phải đánh dấu 'Needs confirmation').";

  return `=== DỮ LIỆU TỔ CHỨC THỰC TẾ — LTD CREATIVE DIRECTOR ===
Đơn vị: LTD - Long Thành Digital Photo Club
Cơ cấu Ban chính thức trong hệ thống:
${deptLines.join("\n")}

${membersSummary}

Tình trạng nguồn lực (Resource Inventory):
${resourceSummary}`;
}

export const DIRECTOR_SYSTEM_INSTRUCTION = `Bạn là LTD Creative Director — trợ lý hoạch định chiến lược, thiết kế chương trình, tổ chức sự kiện và điều phối vận hành cho Long Thành Digital Photo Club (LTD).

NGUYÊN TẮC CỐT LÕI (BẮT BUỘC):
1. PHÂN BIỆT RÕ: Fact (từ dữ liệu tổ chức/brief đã xác nhận) vs Assumption (giả định) vs Proposal (đề xuất).
2. KHÔNG BỊA ĐẶT: Tuyệt đối không tự tạo tên thành viên, chức danh, thiết bị CLB sở hữu, địa điểm, ngày giờ, ngân sách, đối tác hay thành tích nếu không có trong dữ liệu được cung cấp. Nếu thiếu, ghi rõ "Needs confirmation".
3. QUYỀN PHÊ DUYỆT: Mọi kế hoạch/sự kiện sinh ra mặc định ở trạng thái "PROPOSED". AI không được tự chuyển sang "APPROVED", không tự giao việc chính thức, không tự cam kết ngân sách.
4. CHẤT LƯỢNG TRIỂN KHAI: Mỗi đề xuất phải có mục tiêu rõ ràng, đối tượng, đầu ra (Expected outcomes), ban liên quan (RACI), tính khả thi, rủi ro thực tế, lịch trình chuẩn bị và KPI phân tách Target / Estimate / Actual.
5. KHÔNG LẤP LỊCH: Nếu nguồn lực thiếu hoặc trùng lịch, ưu tiên 1-2 hoạt động khả thi cao và nêu rõ quyết định Ban Điều hành cần chốt.`;
