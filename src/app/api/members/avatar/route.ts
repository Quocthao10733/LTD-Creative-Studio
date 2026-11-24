import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Member } from "@/lib/types/member";

const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "members.json");
const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

function getMembers(): Member[] {
  if (!fs.existsSync(dataFilePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(dataFilePath, "utf-8")) as Member[];
  } catch {
    return [];
  }
}

function saveMembers(members: Member[]) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(members, null, 2), "utf-8");
}

export async function POST(request: NextRequest) {
  try {
    ensureUploadsDir();
    const contentType = request.headers.get("content-type") || "";

    let memberId = "";
    let avatarUrl = "";

    // Handle Multipart Form Data (File Upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      memberId = (formData.get("id") as string) || "";
      const file = formData.get("file") as File | null;

      if (!memberId) {
        return NextResponse.json({ success: false, error: "Thiếu ID thành viên" }, { status: 400 });
      }

      if (!file) {
        return NextResponse.json({ success: false, error: "Không tìm thấy file ảnh tải lên" }, { status: 400 });
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ success: false, error: "Vui lòng chỉ chọn định dạng ảnh (JPG, PNG, WebP)" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const cleanExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
      const filename = `avatar-${memberId}-${Date.now()}.${cleanExt}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);
      avatarUrl = `/uploads/avatars/${filename}`;
    } else {
      // Handle JSON (Base64 data or Image URL)
      const body = await request.json();
      memberId = body.id;
      const avatarData = body.avatar;

      if (!memberId) {
        return NextResponse.json({ success: false, error: "Thiếu ID thành viên" }, { status: 400 });
      }

      if (!avatarData) {
        return NextResponse.json({ success: false, error: "Thiếu dữ liệu ảnh" }, { status: 400 });
      }

      if (typeof avatarData === "string" && avatarData.startsWith("data:image/")) {
        // Base64 Data URL
        const matches = avatarData.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
          const cleanExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "png";
          const filename = `avatar-${memberId}-${Date.now()}.${cleanExt}`;
          const filePath = path.join(uploadsDir, filename);
          const buffer = Buffer.from(matches[2], "base64");

          fs.writeFileSync(filePath, buffer);
          avatarUrl = `/uploads/avatars/${filename}`;
        } else {
          avatarUrl = avatarData;
        }
      } else {
        avatarUrl = avatarData;
      }
    }

    // Update member record in data/members.json
    const members = getMembers();
    const index = members.findIndex((m) => m.id === memberId);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy thành viên có ID này" }, { status: 404 });
    }

    members[index].avatar = avatarUrl;
    saveMembers(members);

    return NextResponse.json({
      success: true,
      message: "Cập nhật ảnh đại diện thành công!",
      avatar: avatarUrl,
      member: members[index],
    });
  } catch (error: any) {
    console.error("Lỗi cập nhật avatar:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xử lý tải ảnh" },
      { status: 500 }
    );
  }
}
