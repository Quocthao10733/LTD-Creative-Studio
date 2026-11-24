import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const AUTH_COOKIE_NAME = "ltd_admin_session";

function getAdminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD?.trim()) {
    return process.env.ADMIN_PASSWORD.trim();
  }
  // Try reading from .env.local if not loaded into env yet
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^ADMIN_PASSWORD=(.+)$/m);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch {}
  return null;
}

// GET: Check authentication status
export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isAuthenticated = cookie?.value === "authenticated_admin_ltd";

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}

// POST: Verify password and log in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập mật khẩu Quản trị viên!" },
        { status: 400 }
      );
    }

    const currentPass = getAdminPassword();
    if (!currentPass) {
      return NextResponse.json(
        { success: false, error: "Chưa cấu hình ADMIN_PASSWORD trên máy chủ!" },
        { status: 503 }
      );
    }

    if (password.trim() === currentPass) {
      const response = NextResponse.json({
        success: true,
        message: "Xác thực Quản trị viên thành công!",
      });

      // Set cookie for 7 days
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: "authenticated_admin_ltd",
        httpOnly: false, // Accessible to client for instant UI state
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
        sameSite: "lax",
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: "Mật khẩu không chính xác. Vui lòng thử lại!" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xử lý xác thực" },
      { status: 500 }
    );
  }
}

// DELETE: Lock / Logout
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Đã khóa trang Cài đặt thành công",
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });

  return response;
}

// PUT: Change Admin Password
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu mới phải có ít nhất 4 ký tự!" },
        { status: 400 }
      );
    }

    const activePass = getAdminPassword();
    if (currentPassword?.trim() !== activePass) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu hiện tại không đúng!" },
        { status: 401 }
      );
    }

    // Update .env.local
    const envPath = path.join(process.cwd(), ".env.local");
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    if (envContent.includes("ADMIN_PASSWORD=")) {
      envContent = envContent.replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${newPassword.trim()}`);
    } else {
      envContent += `\nADMIN_PASSWORD=${newPassword.trim()}\n`;
    }

    fs.writeFileSync(envPath, envContent, "utf-8");
    process.env.ADMIN_PASSWORD = newPassword.trim();

    return NextResponse.json({
      success: true,
      message: "Đã đổi mật khẩu Quản trị viên thành công!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi đổi mật khẩu" },
      { status: 500 }
    );
  }
}
