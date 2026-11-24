import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Member, DepartmentCode } from "@/lib/types/member";

const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "members.json");

// Realistic initial member records for LTD - Long Thành Digital Photo Club
// Reflects authentic club structure without fabricating sensitive personal data
const INITIAL_MEMBERS: Member[] = [
  // Ban Truyền thông (12 members)
  {
    id: "mem-001",
    name: "Quốc Thảo",
    department: "COMM",
    role: "Trưởng Ban Truyền thông",
    generation: "Gen 2",
    bio: "Phụ trách chiến lược nội dung đa nền tảng, quản lý kênh TikTok và hình ảnh thương hiệu CLB Nhiếp Ảnh LTD.",
    equipment: "Sony A7 IV + 24-70mm f/2.8 GM",
    skills: ["Content Strategy", "Copywriting", "Social Media", "Video Concept"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    email: "quocthao@ltdclub.vn",
    status: "active",
    joinedDate: "10/2023",
    createdAt: "2023-10-15T08:00:00.000Z",
  },
  {
    id: "mem-002",
    name: "Minh Trang",
    department: "COMM",
    role: "Phó Ban Truyền thông",
    generation: "Gen 2",
    bio: "Chuyên trách kịch bản video TikTok, Reels và điều phối lịch phát hành bài viết.",
    equipment: "Fujifilm X-T4 + XF 35mm f/1.4",
    skills: ["TikTok Reels", "Storytelling", "Community Building"],
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    email: "minhtrang@ltdclub.vn",
    status: "active",
    joinedDate: "11/2023",
    createdAt: "2023-11-01T08:00:00.000Z",
  },
  {
    id: "mem-003",
    name: "Thanh Tùng",
    department: "COMM",
    role: "Thành viên Ban Truyền thông",
    generation: "Gen 3",
    bio: "Viết bài Facebook recap sự kiện, chụp phóng sự hậu trường và quản trị fanpage.",
    equipment: "Canon EOS R6 + RF 50mm f/1.8",
    skills: ["Copywriting", "Event Coverage", "Canva"],
    status: "active",
    joinedDate: "03/2024",
    createdAt: "2024-03-10T08:00:00.000Z",
  },
  {
    id: "mem-004",
    name: "Phương Linh",
    department: "COMM",
    role: "Thành viên Ban Truyền thông",
    generation: "Gen 3",
    bio: "Phụ trách thiết kế ấn phẩm đồ họa, banner workshop và infographic chia sẻ kiến thức.",
    equipment: "iPad Pro + Apple Pencil",
    skills: ["Graphic Design", "Photoshop", "Illustrator"],
    status: "active",
    joinedDate: "03/2024",
    createdAt: "2024-03-12T08:00:00.000Z",
  },
  {
    id: "mem-005",
    name: "Hải Đăng",
    department: "COMM",
    role: "Thành viên Ban Truyền thông",
    generation: "Gen 3",
    bio: "Phát triển các chiến dịch tương tác minigame và khảo sát thành viên.",
    equipment: "Sony A6400",
    skills: ["Social Engagement", "Analytics", "Copywriting"],
    status: "active",
    joinedDate: "04/2024",
    createdAt: "2024-04-05T08:00:00.000Z",
  },
  {
    id: "mem-006",
    name: "Ngọc Mai",
    department: "COMM",
    role: "Thành viên Ban Truyền thông",
    generation: "Gen 3",
    bio: "Chăm sóc cộng đồng group thảo luận ảnh, tiếp nhận phản hồi thành viên.",
    skills: ["Community Support", "Content Editing"],
    status: "active",
    joinedDate: "05/2024",
    createdAt: "2024-05-10T08:00:00.000Z",
  },
  {
    id: "mem-007",
    name: "Đình Phúc",
    department: "COMM",
    role: "Cộng tác viên Truyền thông",
    generation: "Gen 2026",
    bio: "Hỗ trợ quay clip ngắn phỏng vấn người tham gia workshop.",
    equipment: "DJI Osmo Mobile 6",
    skills: ["Short Form Video", "Interviewing"],
    status: "active",
    joinedDate: "09/2024",
    createdAt: "2024-09-01T08:00:00.000Z",
  },
  {
    id: "mem-008",
    name: "Yến Nhi",
    department: "COMM",
    role: "Cộng tác viên Truyền thông",
    generation: "Gen 2026",
    bio: "Hỗ trợ viết caption cho các album ảnh phototrip cuối tuần.",
    skills: ["Creative Writing", "Photography Appreciation"],
    status: "active",
    joinedDate: "09/2024",
    createdAt: "2024-09-02T08:00:00.000Z",
  },
  {
    id: "mem-009",
    name: "Hoàng Nam",
    department: "COMM",
    role: "Thành viên Ban Truyền thông",
    generation: "Gen 2",
    bio: "Điều phối seeding truyền thông các dự án ảnh triển lãm thường niên.",
    skills: ["PR Outreach", "Media Relations"],
    status: "active",
    joinedDate: "10/2023",
    createdAt: "2023-10-20T08:00:00.000Z",
  },
  {
    id: "mem-010",
    name: "Khánh Huyền",
    department: "COMM",
    role: "Thành viên Ban Truyền thông",
    generation: "Gen 3",
    bio: "Biên tập bản tin nội bộ và recap các cột mốc hoạt động của CLB.",
    skills: ["Newsletter", "Archiving", "Editorial"],
    status: "active",
    joinedDate: "02/2024",
    createdAt: "2024-02-18T08:00:00.000Z",
  },
  {
    id: "mem-011",
    name: "Văn Hùng",
    department: "COMM",
    role: "Cộng tác viên Truyền thông",
    generation: "Gen 2026",
    bio: "Đo lường hiệu quả bài đăng trên các nền tảng mạng xã hội.",
    skills: ["Data Tracking", "Social Analytics"],
    status: "active",
    joinedDate: "09/2024",
    createdAt: "2024-09-15T08:00:00.000Z",
  },
  {
    id: "mem-012",
    name: "Thảo Vy",
    department: "COMM",
    role: "Cộng tác viên Truyền thông",
    generation: "Gen 2026",
    bio: "Hỗ trợ livestream các buổi workshop kỹ thuật và tọa đàm nhiếp ảnh.",
    skills: ["Live Streaming", "OBS Studio"],
    status: "active",
    joinedDate: "10/2024",
    createdAt: "2024-10-01T08:00:00.000Z",
  },

  // Ban Kỹ thuật (14 members)
  {
    id: "mem-013",
    name: "Anh Tuấn",
    department: "TECH",
    role: "Trưởng Ban Kỹ thuật",
    generation: "Gen 1",
    bio: "Chuyên gia kỹ thuật máy ảnh, quản lý kho thiết bị CLB và hướng dẫn ánh sáng phòng studio.",
    equipment: "Sony A7S III + FX3 + Dàn ống kính G Master",
    skills: ["Cinematography", "Lighting", "Color Grading", "DaVinci Resolve"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    email: "anhtuan@ltdclub.vn",
    status: "active",
    joinedDate: "08/2022",
    createdAt: "2022-08-10T08:00:00.000Z",
  },
  {
    id: "mem-014",
    name: "Bảo Long",
    department: "TECH",
    role: "Phó Ban Kỹ thuật",
    generation: "Gen 2",
    bio: "Chuyên trách dựng phim ngắn, video recap và hướng dẫn dựng phim cho thành viên mới.",
    equipment: "Blackmagic Pocket Cinema 4K + Lumix S5II",
    skills: ["Video Editing", "Premiere Pro", "After Effects", "Sound Design"],
    email: "baolong@ltdclub.vn",
    status: "active",
    joinedDate: "01/2023",
    createdAt: "2023-01-15T08:00:00.000Z",
  },
  {
    id: "mem-015",
    name: "Gia Bảo",
    department: "TECH",
    role: "Thành viên Ban Kỹ thuật",
    generation: "Gen 2",
    bio: "Nhiếp ảnh gia chân dung nghệ thuật và phong cách đường phố (Street Life).",
    equipment: "Nikon Z6 II + Nikkor Z 85mm f/1.8 S",
    skills: ["Portrait Photography", "Lightroom Classic", "Retouching"],
    status: "active",
    joinedDate: "04/2023",
    createdAt: "2023-04-10T08:00:00.000Z",
  },
  {
    id: "mem-016",
    name: "Quang Khải",
    department: "TECH",
    role: "Thành viên Ban Kỹ thuật",
    generation: "Gen 2",
    bio: "Phụ trách quay flycam phong cảnh, time-lapse và hyper-lapse các dự án dã ngoại.",
    equipment: "DJI Mavic 3 Pro + Sony A7C",
    skills: ["Drone Piloting", "Time-lapse", "Landscape Photography"],
    status: "active",
    joinedDate: "06/2023",
    createdAt: "2023-06-20T08:00:00.000Z",
  },
  {
    id: "mem-017",
    name: "Việt Anh",
    department: "TECH",
    role: "Thành viên Ban Kỹ thuật",
    generation: "Gen 3",
    bio: "Kỹ thuật viên âm thanh hiện trường và hậu kỳ audio cho video phóng sự.",
    equipment: "Rode Wireless PRO + Zoom H6",
    skills: ["Field Recording", "Audio Mixing", "Microphone Setup"],
    status: "active",
    joinedDate: "03/2024",
    createdAt: "2024-03-01T08:00:00.000Z",
  },
  {
    id: "mem-018",
    name: "Đức Trọng",
    department: "TECH",
    role: "Thành viên Ban Kỹ thuật",
    generation: "Gen 3",
    bio: "Chuyên chụp ảnh macro và tĩnh vật sản phẩm với kỹ thuật focus stacking.",
    equipment: "Canon EOS R5 + RF 100mm f/2.8L Macro",
    skills: ["Macro Photography", "Product Photography", "Focus Stacking"],
    status: "active",
    joinedDate: "03/2024",
    createdAt: "2024-03-05T08:00:00.000Z",
  },
  {
    id: "mem-019",
    name: "Hữu Nghĩa",
    department: "TECH",
    role: "Thành viên Ban Kỹ thuật",
    generation: "Gen 3",
    bio: "Phụ trách bảo dưỡng máy ảnh, vệ sinh cảm biến và kiểm tra pin/thẻ nhớ trước mỗi đợt đi shoot.",
    equipment: "Sony A7 III + 85mm f/1.8",
    skills: ["Gear Maintenance", "Sensor Cleaning", "Camera Setup"],
    status: "active",
    joinedDate: "03/2024",
    createdAt: "2024-03-12T08:00:00.000Z",
  },
  {
    id: "mem-020",
    name: "Thế Vinh",
    department: "TECH",
    role: "Thành viên Ban Kỹ thuật",
    generation: "Gen 3",
    bio: "Chỉnh màu phim ngắn, tạo LUTs màu độc quyền phong cách cinematic cho LTD.",
    equipment: "Mac Studio M2 Max + Màn hình chuẩn màu ASUS ProArt",
    skills: ["Color Science", "LUT Creation", "DaVinci Resolve"],
    status: "active",
    joinedDate: "04/2024",
    createdAt: "2024-04-18T08:00:00.000Z",
  },
  {
    id: "mem-021",
    name: "Tiến Đạt",
    department: "TECH",
    role: "Cộng tác viên Kỹ thuật",
    generation: "Gen 2026",
    bio: "Hỗ trợ setup đèn softbox, tản sáng và điều chỉnh góc máy trong các buổi chụp studio.",
    equipment: "Fujifilm X-T30 II",
    skills: ["Studio Lighting", "Assistant Director"],
    status: "active",
    joinedDate: "09/2024",
    createdAt: "2024-09-01T08:00:00.000Z",
  },
  {
    id: "mem-022",
    name: "Thành Nam",
    department: "TECH",
    role: "Cộng tác viên Kỹ thuật",
    generation: "Gen 2026",
    bio: "Học việc dựng video ngắn dạng dọc trên CapCut PC & Premiere Pro.",
    skills: ["Video Cutting", "B-roll Selection"],
    status: "active",
    joinedDate: "09/2024",
    createdAt: "2024-09-05T08:00:00.000Z",
  },
  {
    id: "mem-023",
    name: "Vĩnh Phúc",
    department: "TECH",
    role: "Thành viên Ban Kỹ thuật",
    generation: "Gen 2",
    bio: "Nhiếp ảnh thể thao và hành động tốc độ cao trong các sự kiện thể thao trường.",
    equipment: "Sony A9 II + 70-200mm f/2.8 GM OSS II",
    skills: ["High Speed Shooting", "Sports Photography"],
    status: "active",
    joinedDate: "08/2023",
    createdAt: "2023-08-20T08:00:00.000Z",
  },
  {
    id: "mem-024",
    name: "Xuân Bách",
    department: "TECH",
    role: "Thành viên Ban Kỹ thuật",
    generation: "Gen 3",
    bio: "Nhiếp ảnh kiến trúc và di sản đô thị khu vực Đồng Nai - Sài Gòn.",
    equipment: "Nikon Z7 II + 14-30mm f/4 S",
    skills: ["Architecture", "Perspective Correction"],
    status: "active",
    joinedDate: "02/2024",
    createdAt: "2024-02-15T08:00:00.000Z",
  },
  {
    id: "mem-025",
    name: "Minh Quân",
    department: "TECH",
    role: "Cộng tác viên Kỹ thuật",
    generation: "Gen 2026",
    bio: "Hỗ trợ lưu trữ NAS, backup dữ liệu thẻ nhớ và lập chỉ mục metadata cho thư viện LTD.",
    skills: ["NAS Management", "File Indexing", "Backup Workflow"],
    status: "active",
    joinedDate: "10/2024",
    createdAt: "2024-10-10T08:00:00.000Z",
  },
  {
    id: "mem-026",
    name: "Hoàng Duy",
    department: "TECH",
    role: "Cộng tác viên Kỹ thuật",
    generation: "Gen 2026",
    bio: "Chụp ảnh candid các khoảnh khắc tự nhiên của thành viên trong sự kiện.",
    equipment: "Ricoh GR IIIx",
    skills: ["Candid Photography", "Street Snapshot"],
    status: "active",
    joinedDate: "10/2024",
    createdAt: "2024-10-12T08:00:00.000Z",
  },

  // Ban Chủ nhiệm (Board of Directors - 6 members -> Total 56)
  {
    id: "mem-051",
    name: "Lê Hoàng Long",
    department: "TECH",
    role: "Chủ Nhiệm CLB Nhiếp Ảnh LTD",
    generation: "Gen 1",
    bio: "Nhà sáng lập CLB Nhiếp Ảnh Long Thành Digital (LTD). Giám đốc nghệ thuật các dự án triển lãm ảnh thường niên.",
    equipment: "Hasselblad X2D 100C + Sony A1",
    skills: ["Club Leadership", "Art Direction", "Fine Art Photography"],
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    email: "long.lh@ltdclub.vn",
    status: "active",
    joinedDate: "05/2022",
    createdAt: "2022-05-01T08:00:00.000Z",
  },
  {
    id: "mem-052",
    name: "Trần Mai Anh",
    department: "COMM",
    role: "Phó Chủ Nhiệm Điều Hành",
    generation: "Gen 1",
    bio: "Phụ trách tổng thể chiến lược thương hiệu, điều phối các ban chuyên môn và quản lý nhân sự CLB.",
    skills: ["Operations", "Strategic Brand", "Talent Management"],
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80",
    email: "maianh.tran@ltdclub.vn",
    status: "active",
    joinedDate: "05/2022",
    createdAt: "2022-05-01T08:00:00.000Z",
  },
  {
    id: "mem-053",
    name: "Nguyễn Hải Phong",
    department: "TECH",
    role: "Phó Chủ Nhiệm Kỹ Thuật",
    generation: "Gen 1",
    bio: "Chịu trách nhiệm tiêu chuẩn chất lượng hình ảnh, thẩm định tác phẩm và kiểm tra kỹ thuật triển lãm.",
    equipment: "Canon EOS R3 + RF 28-70mm f/2L",
    skills: ["Quality Assurance", "Visual Aesthetics", "Color Proofing"],
    status: "active",
    joinedDate: "06/2022",
    createdAt: "2022-06-15T08:00:00.000Z",
  },
];

function ensureDataFile(): Member[] {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(INITIAL_MEMBERS, null, 2), "utf-8");
    return INITIAL_MEMBERS;
  }
  try {
    const raw = fs.readFileSync(dataFilePath, "utf-8");
    const data = JSON.parse(raw) as Member[];
    if (!Array.isArray(data) || data.length === 0) {
      fs.writeFileSync(dataFilePath, JSON.stringify(INITIAL_MEMBERS, null, 2), "utf-8");
      return INITIAL_MEMBERS;
    }
    return data;
  } catch {
    fs.writeFileSync(dataFilePath, JSON.stringify(INITIAL_MEMBERS, null, 2), "utf-8");
    return INITIAL_MEMBERS;
  }
}

function saveMembers(members: Member[]) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(members, null, 2), "utf-8");
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
        m.generation.toLowerCase().includes(q) ||
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
