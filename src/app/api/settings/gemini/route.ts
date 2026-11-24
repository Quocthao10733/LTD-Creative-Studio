import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const AUTH_COOKIE_NAME = "ltd_admin_session";

function isAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  return cookie?.value === "authenticated_admin_ltd";
}

function getEnvFilePath(): string {
  return path.join(process.cwd(), ".env.local");
}

function readGeminiKey(): string | null {
  if (process.env.GEMINI_API_KEY?.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  const envPath = getEnvFilePath();
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^GEMINI_API_KEY=(.+)$/m);
      if (match && match[1]) {
        return match[1].trim();
      }
    } catch {}
  }
  return null;
}

// GET: Check if Gemini API Key is configured on the server
export async function GET(request: NextRequest) {
  const key = readGeminiKey();
  const configured = Boolean(key && key.length > 10);
  const maskedKey = configured && key
    ? `${key.slice(0, 6)}...${key.slice(-4)}`
    : "";

  return NextResponse.json({
    configured,
    maskedKey,
  });
}

// POST: Save or update Gemini API Key on server
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: "Bạn chưa xác thực quyền Quản trị viên!" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 15) {
      return NextResponse.json(
        { success: false, error: "Định dạng Gemini API Key không hợp lệ!" },
        { status: 400 }
      );
    }

    const cleanKey = apiKey.trim();

    // Verify key with Gemini API
    try {
      const testClient = new GoogleGenAI({ apiKey: cleanKey });
      await testClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Ping",
      });
    } catch (testError: any) {
      console.warn("Lưu ý: Kiểm tra key ban đầu cảnh báo:", testError.message);
      // We still allow saving if it's a valid string format in case of transient quota/network
    }

    // Update in-memory process.env
    process.env.GEMINI_API_KEY = cleanKey;

    // Persist to .env.local
    const envPath = getEnvFilePath();
    let content = "";
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, "utf-8");
    }

    if (/^GEMINI_API_KEY=.*$/m.test(content)) {
      content = content.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${cleanKey}`);
    } else if (/#\s*GEMINI_API_KEY=.*$/m.test(content)) {
      content = content.replace(/#\s*GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${cleanKey}`);
    } else {
      content += `\nGEMINI_API_KEY=${cleanKey}\n`;
    }

    fs.writeFileSync(envPath, content, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Đã lưu và kích hoạt Google Gemini API Key thành công trên máy chủ!",
      maskedKey: `${cleanKey.slice(0, 6)}...${cleanKey.slice(-4)}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi lưu API Key" },
      { status: 500 }
    );
  }
}
