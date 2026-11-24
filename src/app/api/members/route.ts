import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Member, DepartmentCode } from "@/lib/types/member";

const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "members.json");

// Dữ liệu thành viên chính thức của CLB Nhiếp Ảnh LTD
const INITIAL_MEMBERS: Member[] = [
  {
    id: "mem-1795424029590",
    name: "Phạm Trung Kiên",
    department: "TECH",
    role: "Trưởng Ban Kỹ Thuật LTD K25 - K26",
    generation: "Gen 1",
    bio: "",
    skills: [],
    status: "active",
    joinedDate: "10/2023",
    createdAt: "2026-11-23T08:53:49.590Z",
    avatar: "/uploads/avatars/avatar-mem-1795424029590-1795424038468.jpg",
    equipment: "",
    email: ""
  },
  {
    id: "mem-1795423960072",
    name: "Nguyễn Hà Thanh",
    department: "COMM",
    role: "Phó Chủ Nhiệm - Trưởng Ban Truyền Thông LTD K25 - K26",
    generation: "Gen 1",
    bio: "",
    skills: [],
    status: "active",
    joinedDate: "10/2023",
    createdAt: "2026-11-23T08:52:40.072Z",
    avatar: "/uploads/avatars/avatar-mem-1795423960072-1795423976776.jpg",
    equipment: "",
    email: ""
  },
  {
    id: "mem-1795423861621",
    name: "Lê Quốc Hào",
    department: "TECH",
    role: "Chủ Nhiệm LTD K25 - K26",
    generation: "Gen 1",
    bio: "",
    skills: [],
    status: "active",
    joinedDate: "10/2023",
    createdAt: "2026-11-23T08:51:01.630Z",
    avatar: "/uploads/avatars/avatar-mem-1795423861621-1795423891378.jpg",
    equipment: "",
    email: ""
  },
  {
    id: "mem-051",
    name: "Đỗ Quốc Thảo",
    department: "TECH",
    role: "Chủ Tịch CLB Nhiếp Ảnh LTD",
    generation: "Gen 1",
    bio: "Nhà sáng lập CLB Nhiếp Ảnh Long Thành Digital (LTD). Giám đốc nghệ thuật các dự án triển lãm ảnh thường niên.",
    equipment: "Sony A7 IV + 24-70mm f/2.8 GM",
    skills: [
      "Club Leadership",
      "Art Direction",
      "Fine Art Photography"
    ],
    avatar: "/uploads/avatars/avatar-mem-051-1795423474245.jpg",
    email: "",
    status: "active",
    joinedDate: "06/2024",
    createdAt: "2022-05-01T08:00:00.000Z"
  },
  {
    id: "mem-052",
    name: "Võ Huỳnh Như",
    department: "COMM",
    role: "Phó Chủ Tịch CLB Nhiếp Ảnh LTD",
    generation: "Gen 1",
    bio: "Phụ trách tổng thể chiến lược thương hiệu, điều phối các ban chuyên môn và quản lý nhân sự CLB.",
    skills: [
      "Operations",
      "Strategic Brand",
      "Talent Management"
    ],
    avatar: "/uploads/avatars/avatar-mem-052-1795488673693.jpg",
    email: "",
    status: "active",
    joinedDate: "06/2024",
    createdAt: "2022-05-01T08:00:00.000Z",
    equipment: ""
  }
];

// Bộ nhớ tạm trong phiên chạy serverless nếu không thể ghi file
let memoryMembers: Member[] | null = null;

function ensureDataFile(): Member[] {
  if (memoryMembers && memoryMembers.length > 0) {
    return memoryMembers;
  }
  try {
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, "utf-8");
      const data = JSON.parse(raw) as Member[];
      if (Array.isArray(data) && data.length > 0) {
        memoryMembers = data;
        return data;
      }
    }
  } catch (err) {
    console.warn("Không thể đọc file members.json, dùng dữ liệu mặc định:", err);
  }

  // Cố gắng ghi file nếu có quyền (môi trường local)
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(INITIAL_MEMBERS, null, 2), "utf-8");
  } catch {
    // Bỏ qua lỗi EROFS trên Vercel serverless
  }

  memoryMembers = [...INITIAL_MEMBERS];
  return memoryMembers;
}

function saveMembers(members: Member[]) {
  memoryMembers = members;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(members, null, 2), "utf-8");
  } catch {
    // Bỏ qua lỗi EROFS trên Vercel serverless
  }
}

// GET: Lấy danh sách thành viên với bộ lọc và tìm kiếm
export async function GET(request: NextRequest) {
  const members = ensureDataFile();
  const searchParams = request.nextUrl.searchParams;
  const dept = searchParams.get("department");
  const q = searchParams.get("q")?.toLowerCase();

  let filtered = members;
  if (dept && dept !== "all") {
    filtered = filtered.filter((m) => m.department === dept);
  }
  if (q) {
    filtered = filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q) ||
        (m.generation && m.generation.toLowerCase().includes(q)) ||
        (m.equipment && m.equipment.toLowerCase().includes(q)) ||
        (m.skills && m.skills.some((s) => s.toLowerCase().includes(q)))
    );
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
    counts: {
      total: members.length,
      COMM: members.filter((m) => m.department === "COMM").length,
      TECH: members.filter((m) => m.department === "TECH").length,
    },
  });
}

// POST: Thêm thành viên mới hoặc import danh sách CSV
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const members = ensureDataFile();

    // Import mảng thành viên
    if (Array.isArray(body)) {
      const newItems: Member[] = body.map((item) => ({
        id: item.id || "mem-" + Date.now().toString() + Math.random().toString(36).substring(2, 5),
        name: String(item.name || "").trim(),
        department: (item.department || "COMM") as DepartmentCode,
        role: String(item.role || "Thành viên").trim(),
        generation: String(item.generation || "Gen 2026").trim(),
        bio: String(item.bio || "").trim(),
        equipment: item.equipment ? String(item.equipment).trim() : undefined,
        skills: Array.isArray(item.skills) ? item.skills : [],
        avatar: item.avatar || undefined,
        email: item.email || undefined,
        status: "active",
        joinedDate: item.joinedDate || "11/2026",
        createdAt: item.createdAt || new Date().toISOString(),
      }));

      const updated = [...members, ...newItems.filter((i) => i.name)];
      saveMembers(updated);
      return NextResponse.json({
        success: true,
        message: `Đã import thành công ${newItems.length} thành viên`,
        count: updated.length,
      });
    }

    // Thêm 1 thành viên
    const { name, department, role, generation, bio, equipment, skills, email, phone, avatar, joinedDate } = body;
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Họ và tên thành viên là bắt buộc" },
        { status: 400 }
      );
    }

    const newMember: Member = {
      id: "mem-" + Date.now().toString(),
      name: name.trim(),
      department: (department || "COMM") as DepartmentCode,
      role: (role || "Thành viên").trim(),
      generation: (generation || "Gen 2026").trim(),
      bio: (bio || "").trim(),
      equipment: equipment ? equipment.trim() : undefined,
      skills: Array.isArray(skills) ? skills : [],
      email: email ? email.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      avatar: avatar ? avatar.trim() : undefined,
      status: "active",
      joinedDate: joinedDate ? String(joinedDate).trim() : new Date().toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" }),
      createdAt: new Date().toISOString(),
    };

    members.unshift(newMember);
    saveMembers(members);

    return NextResponse.json({
      success: true,
      message: "Đã thêm thành viên thành công",
      data: newMember,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xử lý" },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật thành viên
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, department, role, generation, bio, equipment, skills, email, avatar, status, joinedDate } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID thành viên" }, { status: 400 });
    }

    const members = ensureDataFile();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy thành viên" }, { status: 404 });
    }

    members[index] = {
      ...members[index],
      name: name ? name.trim() : members[index].name,
      department: department ? (department as DepartmentCode) : members[index].department,
      role: role ? role.trim() : members[index].role,
      generation: generation ? generation.trim() : members[index].generation,
      bio: bio !== undefined ? bio.trim() : members[index].bio,
      equipment: equipment !== undefined ? equipment.trim() : members[index].equipment,
      skills: Array.isArray(skills) ? skills : members[index].skills,
      email: email !== undefined ? email.trim() : members[index].email,
      avatar: avatar !== undefined ? avatar.trim() : members[index].avatar,
      joinedDate: joinedDate !== undefined ? joinedDate.trim() : members[index].joinedDate,
      status: status || members[index].status,
    };

    saveMembers(members);
    return NextResponse.json({
      success: true,
      message: "Đã cập nhật thông tin thành viên",
      data: members[index],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi cập nhật" },
      { status: 500 }
    );
  }
}

// DELETE: Xóa thành viên
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID thành viên" }, { status: 400 });
    }

    const members = ensureDataFile();
    const filtered = members.filter((m) => m.id !== id);
    saveMembers(filtered);

    return NextResponse.json({
      success: true,
      message: "Đã xóa thành viên khỏi danh bạ",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xóa" },
      { status: 500 }
    );
  }
}
