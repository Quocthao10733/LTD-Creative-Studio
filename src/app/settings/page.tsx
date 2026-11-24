"use client";

import * as React from "react";
import {
  Settings,
  Key,
  Cpu,
  CheckCircle2,
  Save,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Database,
  Globe,
  Radio,
  Flame,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  ShieldAlert,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  FirebaseConfig,
} from "@/lib/firebase";

export default function SettingsPage() {
  // Authentication State
  const [isAdminAuth, setIsAdminAuth] = React.useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = React.useState<boolean>(true);
  const [adminPassInput, setAdminPassInput] = React.useState<string>("");
  const [showAdminPass, setShowAdminPass] = React.useState<boolean>(false);
  const [authError, setAuthError] = React.useState<string>("");
  const [authSubmitting, setAuthSubmitting] = React.useState<boolean>(false);

  // Change Password State
  const [showChangePassModal, setShowChangePassModal] = React.useState<boolean>(false);
  const [oldPass, setOldPass] = React.useState<string>("");
  const [newPass, setNewPass] = React.useState<string>("");
  const [changePassStatus, setChangePassStatus] = React.useState<{ text: string; type: "success" | "error" } | null>(null);
  const [changePassSubmitting, setChangePassSubmitting] = React.useState<boolean>(false);

  // Settings State
  const [selectedModel, setSelectedModel] = React.useState("gemini-3.5-flash-lite");
  const [isSaved, setIsSaved] = React.useState(false);

  // Gemini Server Configuration State
  const [geminiStatus, setGeminiStatus] = React.useState<{ configured: boolean; maskedKey: string }>({
    configured: false,
    maskedKey: "",
  });
  const [newGeminiKey, setNewGeminiKey] = React.useState<string>("");
  const [showGeminiKey, setShowGeminiKey] = React.useState<boolean>(false);
  const [geminiSaving, setGeminiSaving] = React.useState<boolean>(false);
  const [geminiSaveMsg, setGeminiSaveMsg] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchGeminiStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/settings/gemini");
      const json = await res.json();
      setGeminiStatus(json);
    } catch {
      // ignore
    }
  }, []);

  const handleUpdateGeminiKey = async () => {
    if (!newGeminiKey.trim()) {
      setGeminiSaveMsg({ text: "Vui lòng nhập Gemini API Key!", type: "error" });
      return;
    }
    setGeminiSaving(true);
    setGeminiSaveMsg(null);
    try {
      const res = await fetch("/api/settings/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newGeminiKey.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setGeminiSaveMsg({ text: json.message || "Đã lưu API Key thành công!", type: "success" });
        setNewGeminiKey("");
        fetchGeminiStatus();
      } else {
        setGeminiSaveMsg({ text: json.error || "Lỗi lưu API Key", type: "error" });
      }
    } catch {
      setGeminiSaveMsg({ text: "Lỗi kết nối máy chủ khi lưu API Key", type: "error" });
    } finally {
      setGeminiSaving(false);
    }
  };

  // Firebase Realtime State
  const [fbConfig, setFbConfig] = React.useState<FirebaseConfig>({
    databaseURL: "",
    projectId: "",
    apiKey: "",
    authDomain: "",
    appId: "",
  });

  // Check Admin Authentication on Load
  const checkAuth = React.useCallback(async () => {
    try {
      setAuthChecking(true);
      const res = await fetch("/api/auth/admin");
      const json = await res.json();
      setIsAdminAuth(Boolean(json.authenticated));
    } catch {
      setIsAdminAuth(false);
    } finally {
      setAuthChecking(false);
    }
  }, []);

  React.useEffect(() => {
    checkAuth();
    fetchGeminiStatus();

    const cfg = getFirebaseConfig();
    if (cfg) {
      setFbConfig({
        databaseURL: cfg.databaseURL || "",
        projectId: cfg.projectId || "",
        apiKey: cfg.apiKey || "",
        authDomain: cfg.authDomain || "",
        appId: cfg.appId || "",
      });
    }
  }, [checkAuth]);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassInput.trim()) {
      setAuthError("Vui lòng nhập mật khẩu Quản trị!");
      return;
    }

    try {
      setAuthSubmitting(true);
      setAuthError("");

      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassInput.trim() }),
      });

      const json = await res.json();
      if (json.success) {
        setIsAdminAuth(true);
        setAdminPassInput("");
      } else {
        setAuthError(json.error || "Mật khẩu không chính xác!");
      }
    } catch {
      setAuthError("Lỗi kết nối máy chủ xác thực!");
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Handle Lock / Logout
  const handleAdminLock = async () => {
    try {
      await fetch("/api/auth/admin", { method: "DELETE" });
      setIsAdminAuth(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.trim().length < 4) {
      setChangePassStatus({ text: "Mật khẩu mới phải có ít nhất 4 ký tự!", type: "error" });
      return;
    }

    try {
      setChangePassSubmitting(true);
      setChangePassStatus(null);

      const res = await fetch("/api/auth/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: oldPass.trim(),
          newPassword: newPass.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setChangePassStatus({ text: "Đã cập nhật mật khẩu quản trị mới thành công!", type: "success" });
        setOldPass("");
        setNewPass("");
        setTimeout(() => {
          setShowChangePassModal(false);
          setChangePassStatus(null);
        }, 1800);
      } else {
        setChangePassStatus({ text: json.error || "Lỗi cập nhật mật khẩu", type: "error" });
      }
    } catch {
      setChangePassStatus({ text: "Lỗi kết nối máy chủ", type: "error" });
    } finally {
      setChangePassSubmitting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(fbConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const isFbConnected = Boolean(fbConfig.databaseURL || fbConfig.projectId);

  // 1. Loading State
  if (authChecking) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Đang kiểm tra quyền quản trị viên...</p>
      </div>
    );
  }

  // 2. LOCKED STATE: Admin Gate Screen
  if (!isAdminAuth) {
    return (
      <div className="max-w-md mx-auto my-12 animate-in zoom-in-95 duration-200">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-7 sm:p-8 space-y-6 text-center">
          {/* Glowing Lock Badge */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-cyan-500/25 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold mb-2 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Bảo Mật Quản Trị Viên</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Khu Vực Quản Trị Viên LTD
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Trang này lưu trữ các cấu hình nhạy cảm như API Key Gemini, Firebase và hệ thống CLB. Vui lòng nhập mật khẩu Quản trị để tiếp tục.
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase block">
                Mật khẩu Quản trị viên
              </label>
              <div className="relative">
                <input
                  type={showAdminPass ? "text" : "password"}
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị..."
                  autoFocus
                  className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authSubmitting || !adminPassInput.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {authSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Mở Khóa Cài Đặt</span>
                </>
              )}
            </button>
          </form>

          {/* Help Box for Owner */}
          <div className="pt-3 border-t border-slate-100 text-left">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <span>💡</span> Ghi chú cho Ban Chủ Nhiệm:
              </span>
              <p className="text-slate-500">
                Mật khẩu Quản trị viên được cấu hình bằng biến <code className="font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">ADMIN_PASSWORD</code> trên máy chủ.
              </p>
              <p className="text-slate-400 text-[10px]">
                Sau khi mở khóa, bạn có thể đổi sang mật khẩu mới bí mật của riêng bạn bất cứ lúc nào.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. UNLOCKED STATE: Full Settings Interface
  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      {/* Page Header with Admin Status & Lock Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>CÀI ĐẶT HỆ THỐNG — LTD CREATIVE STUDIO</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Cấu Hình AI &amp; Không Gian Làm Việc
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý Google Gemini API Key, lựa chọn mô hình AI và các tùy chọn lưu trữ dữ liệu câu lạc bộ.
          </p>
        </div>

        {/* Admin Status Pill & Logout */}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Đã xác thực Admin</span>
          </span>

          <button
            type="button"
            onClick={handleAdminLock}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Khóa ngay trang cài đặt để bảo mật"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Khóa Lại</span>
          </button>
        </div>
      </div>

      {/* Admin Security Settings Section */}
      <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 via-[#0d1b2e] to-[#0a1627] text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-cyan-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                Bảo Vệ Trang Cài Đặt (Admin Security Gate)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mục Cài đặt đang được bảo vệ an toàn bằng mật khẩu quản trị viên.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowChangePassModal(true)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-300" />
            <span>Đổi Mật Khẩu Admin</span>
          </button>
        </div>
      </div>

      {/* Main Settings Card */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini API Key */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1420] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Google Gemini API Key
              </h3>
            </div>
            {geminiStatus.configured ? (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                Đã kích hoạt trên Server ({geminiStatus.maskedKey})
              </span>
            ) : (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                Chưa có khóa (Đang dùng dữ liệu mẫu)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            API key được lưu trữ bảo mật độc quyền trên server (file <code>.env.local</code>), không bao giờ lộ ra ngoài trình duyệt hay GitHub Push.
          </p>

          {geminiSaveMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                geminiSaveMsg.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
              }`}
            >
              {geminiSaveMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{geminiSaveMsg.text}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showGeminiKey ? "text" : "password"}
                value={newGeminiKey}
                onChange={(e) => setNewGeminiKey(e.target.value)}
                placeholder={geminiStatus.configured ? `Đang dùng: ${geminiStatus.maskedKey} (Dán khóa mới để đổi)` : "Dán khóa AIzaSy... tại đây"}
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-400">
                Lấy API Key miễn phí tại: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>
              </span>
              <button
                type="button"
                onClick={handleUpdateGeminiKey}
                disabled={geminiSaving || !newGeminiKey.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {geminiSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kiểm tra &amp; lưu...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Lưu Khóa Vào Server</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Lựa Chọn Mô Hình Trí Tuệ Nhân Tạo (Gemini Model)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "gemini-3.5-flash-lite",
                name: "Gemini 3.5 Flash Lite",
                desc: "Siêu tốc độ, độ trễ cực thấp, tối ưu cho caption bài đăng, hashtag & TikTok script.",
                badge: "Khuyên dùng",
              },
              {
                id: "gemini-3.8-flash",
                name: "Gemini 3.8 Flash",
                desc: "Thế hệ AI mới nhất, suy luận logic vượt trội và sáng tạo concept đột phá.",
                badge: "Mới nhất",
              },
              {
                id: "gemini-2.5-pro",
                name: "Gemini 2.5 Pro",
                desc: "Suy luận chuyên sâu, tối ưu cho lập kế hoạch chiến dịch và phân tích kịch bản video.",
                badge: "Pro",
              },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  selectedModel === m.id
                    ? "border-blue-600 bg-blue-50/60 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900">{m.name}</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-semibold text-blue-600">
                  {selectedModel === m.id ? "✓ Đang chọn" : "Bấm để chọn"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Firebase Realtime Database Configuration */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">
                Đồng Bộ Thời Gian Thực — Firebase Realtime Database
              </h3>
            </div>
            {isFbConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Firebase Realtime Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                Local Realtime (Sẵn sàng kết nối Firebase)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Nhập thông tin dự án Firebase của bạn để kích hoạt khả năng lắng nghe và cập nhật dữ liệu lịch nội dung, sự kiện theo thời gian thực (Realtime WebSocket) ngay khi có thay đổi từ bất kỳ thiết bị nào.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Database URL (Realtime DB) <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                placeholder="https://your-project-rtdb.firebaseio.com"
                value={fbConfig.databaseURL || ""}
                onChange={(e) => setFbConfig({ ...fbConfig, databaseURL: e.target.value.trim() })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Project ID <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: ltd-creative-studio"
                value={fbConfig.projectId || ""}
                onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value.trim() })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Web API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={fbConfig.apiKey || ""}
                onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value.trim() })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                placeholder="your-project.firebaseapp.com"
                value={fbConfig.authDomain || ""}
                onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value.trim() })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Club Information & Data Persistence Ready for Supabase */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Cấu Trúc Dữ Liệu &amp; Sẵn Sàng Kết Nối Supabase
            </h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống hiện đang lưu trữ danh bạ 29 thành viên và thư viện bài viết qua REST API nội bộ (`/api/members`, `/api/content`). Toàn bộ Schema và Type definitions đã được thiết kế chuẩn Postgres/Supabase sẵn sàng cho việc kích hoạt kết nối Backend đám mây.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800">Database Schema</span>
              <p className="text-slate-500 text-[11px]">
                Bảng <code>members</code> (2 Ban: Ban Truyền thông &amp; Ban Kỹ thuật), <code>content_items</code>, <code>campaigns</code>.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800">Trạng Thái Kết Nối</span>
              <p className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>REST API Serverless Active (JSON Sync)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Submit Save Button & Toast */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã lưu cài đặt thành công!</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </form>

      {/* MODAL: ĐỔI MẬT KHẨU ADMIN */}
      {showChangePassModal && (
        <div
          onClick={() => setShowChangePassModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Đổi Mật Khẩu Quản Trị Viên
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Cập nhật mật khẩu bảo vệ trang Cài đặt.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowChangePassModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {changePassStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  changePassStatus.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}
              >
                {changePassStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{changePassStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  required
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="Mật khẩu đang dùng..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={changePassSubmitting || !newPass.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {changePassSubmitting ? "Đang lưu..." : "Cập Nhật Mật Khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
