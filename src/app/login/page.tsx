"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  Mail,
  Lock,
  User,
  Phone,
  Shield,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  Flame,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, login, register, loginWithGoogle, setLocalProfile } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form đăng nhập
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form đăng ký
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDepartment, setRegDepartment] = useState<"Ban Truyền thông" | "Ban Kỹ thuật">("Ban Truyền thông");
  const [regRole, setRegRole] = useState<"Thành viên" | "Phó Ban" | "Trưởng Ban" | "Chủ tịch CLB">("Thành viên");
  const [regPhone, setRegPhone] = useState("");

  // Xử lý đăng nhập
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await login(loginEmail.trim(), loginPassword);
      setSuccessMsg("Đăng nhập Firebase thành công! Đang chuyển hướng...");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setErrorMsg("Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!");
      } else if (err.code === "auth/user-not-found") {
        setErrorMsg("Tài khoản này chưa tồn tại trên Firebase!");
      } else if (err.code === "auth/too-many-requests") {
        setErrorMsg("Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút!");
      } else {
        setErrorMsg(err.message || "Lỗi đăng nhập Firebase!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng ký
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (regPassword.length < 6) {
      setErrorMsg("Mật khẩu cần có ít nhất 6 ký tự theo chuẩn Firebase!");
      setLoading(false);
      return;
    }

    try {
      await register({
        email: regEmail.trim(),
        password: regPassword,
        displayName: regName.trim(),
        department: regDepartment,
        role: regRole,
        phone: regPhone.trim(),
      });
      setSuccessMsg("Tạo tài khoản thành viên trên Firebase thành công! Đang chuyển hướng...");
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: any) {
      console.error("Lỗi đăng ký:", err);
      if (err.code === "auth/operation-not-allowed") {
        setErrorMsg(
          "Firebase chưa BẬT tính năng đăng ký Email/Password! Vui lòng vào Firebase Console → Authentication → Sign-in method → Bật (Enable) Email/Password, hoặc dùng tùy chọn lưu nội bộ bên dưới."
        );
      } else if (err.code === "auth/email-already-in-use") {
        setErrorMsg("Email này đã được sử dụng! Vui lòng dùng email khác hoặc chuyển sang Đăng Nhập.");
      } else if (err.code === "auth/weak-password") {
        setErrorMsg("Mật khẩu quá yếu! Vui lòng chọn mật khẩu từ 6 ký tự trở lên.");
      } else {
        setErrorMsg(err.message || "Lỗi tạo tài khoản trên Firebase!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Kích hoạt ngay phiên làm việc nội bộ của CLB
  const handleContinueAsLocalAdmin = () => {
    const adminProfile = {
      uid: `local-${Date.now()}`,
      email: regEmail.trim() || loginEmail.trim() || "dothao783@gmail.com",
      displayName: regName.trim() || "Đỗ Quốc Thảo",
      department: regDepartment,
      role: regRole,
      phone: regPhone.trim() || "0785242404",
      photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLocalProfile(adminProfile);
    setSuccessMsg(`Đã kích hoạt phiên làm việc với tư cách ${adminProfile.displayName}! Đang chuyển hướng...`);
    setTimeout(() => {
      router.push("/");
    }, 800);
  };

  // Đăng nhập nhanh Google
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle(regDepartment);
      setSuccessMsg("Đăng nhập Google thành công! Đang chuyển hướng...");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMsg("Lỗi xác thực Google: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] dark:bg-[#090D16] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#0c131d] rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Banner đầu trang */}
        <div className="p-6 pb-4 bg-gradient-to-br from-[#0B132B] via-[#111A3A] to-[#1E293B] text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg mb-3">
            <Camera className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black tracking-tight">LTD CREATIVE STUDIO</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Cổng Đăng Nhập & Quản Lý Thành Viên CLB Nhiếp Ảnh LTD
          </p>

          <div className="mt-4 flex bg-white/10 backdrop-blur-md p-1 rounded-2xl gap-1">
            <button
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => {
                setMode("register");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Đăng Ký Thành Viên
            </button>
          </div>
        </div>

        {/* Thân Form */}
        <div className="p-6 space-y-4">
          {/* Thông báo Lỗi / Thành công */}
          {errorMsg && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>

              {errorMsg.includes("Firebase chưa BẬT") && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2.5">
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Cách bật Email/Password trên Firebase (30 giây):</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    <li>
                      Mở Firebase Console → Chọn dự án <strong>ltd-creative-studio</strong>
                    </li>
                    <li>
                      Vào mục <strong>Authentication → Tab Sign-in method</strong>
                    </li>
                    <li>
                      Click vào <strong>Email/Password</strong> → Bật <strong>Enable</strong> → Bấm{" "}
                      <strong>Save</strong>
                    </li>
                  </ol>
                  <div className="pt-1 flex flex-col sm:flex-row gap-2">
                    <a
                      href="https://console.firebase.google.com/project/ltd-creative-studio/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] inline-flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Mở Firebase Sign-in method</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={handleContinueAsLocalAdmin}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] inline-flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Kích hoạt phiên làm việc ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORM ĐĂNG NHẬP */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email thành viên
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tenban@gmail.com"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập Firebase</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* FORM ĐĂNG KÝ */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và Tên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nguyenvana@gmail.com"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu (ít nhất 6 ký tự)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ban trực thuộc
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
                  >
                    <option value="Ban Truyền thông">Ban Truyền thông</option>
                    <option value="Ban Kỹ thuật">Ban Kỹ thuật</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chức vụ
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
                  >
                    <option value="Thành viên">Thành viên</option>
                    <option value="Phó Ban">Phó Ban</option>
                    <option value="Trưởng Ban">Trưởng Ban</option>
                    <option value="Chủ tịch CLB">Chủ tịch CLB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Số điện thoại / Zalo (Tùy chọn)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Tạo Tài Khoản Firebase</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Phân cách hoặc đăng nhập Google */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="bg-white dark:bg-[#0c131d] px-2">Hoặc</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Đăng nhập với Google</span>
          </button>

          {/* Ghi chú quản lý Firebase cho Admin */}
          <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Quản trị viên CLB:</span> Quản lý, vô hiệu hóa hoặc đổi quyền tất cả tài khoản trực tiếp trong mục <strong>Authentication → Users</strong> trên Firebase Console của bạn.
          </div>

          {/* Điều khoản bảo mật & bản quyền */}
          <div className="pt-2 text-[10px] text-slate-400 text-center">
            Bằng việc sử dụng hệ thống, bạn đồng ý với{" "}
            <Link href="/terms" className="text-blue-600 dark:text-cyan-400 underline hover:opacity-80">
              Điều Khoản Bản Quyền &amp; Bảo Mật LTD Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
