"use client";

import * as React from "react";
import Link from "next/link";
import {
  PenSquare,
  Lightbulb,
  Clapperboard,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Code,
  Image as ImageIcon,
  HeartHandshake,
  Play,
  Settings,
  X,
  Check,
  Save,
  RotateCcw,
  ExternalLink,
  Layers,
  Palette,
  Camera,
  Film,
  Zap,
  ShieldCheck,
  Compass,
} from "lucide-react";

import { RealtimeCalendarWidget } from "@/components/calendar/realtime-calendar-widget";
import { useAuth } from "@/context/auth-context";

interface ClubStats {
  contentCount: number;
  contentTrend: string;
  ideasCount: number;
  ideasTrend: string;
  videoCount: number;
  videoTrend: string;
  membersCount: number;
  membersTrend: string;
  deptCommCount: number;
  deptTechCount: number;
}

const DEFAULT_APPROVED_STATS: ClubStats = {
  contentCount: 24,
  contentTrend: "+12%",
  ideasCount: 8,
  ideasTrend: "+25%",
  videoCount: 12,
  videoTrend: "+20%",
  membersCount: 29,
  membersTrend: "+2%",
  deptCommCount: 13,
  deptTechCount: 16,
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const [viewMode, setViewMode] = React.useState<"cinematic" | "workspace">("cinematic");
  const [stats, setStats] = React.useState<ClubStats>(DEFAULT_APPROVED_STATS);
  const [isEditingStats, setIsEditingStats] = React.useState(false);
  const [editForm, setEditForm] = React.useState<ClubStats>(DEFAULT_APPROVED_STATS);
  const [savedToast, setSavedToast] = React.useState(false);
  const [showShowreelModal, setShowShowreelModal] = React.useState(false);

  // 3D perspective tilt effect and interactive viewfinder state
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [lensMode, setLensMode] = React.useState<"portrait" | "landscape" | "cinema">("portrait");
  const [shutterFlash, setShutterFlash] = React.useState(false);
  const [focusPoint, setFocusPoint] = React.useState({ x: 50, y: 50 });

  const handleViewfinderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
    setFocusPoint({ x, y });

    const tiltX = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const tiltY = -((e.clientY - rect.top) / rect.height - 0.5) * 14;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setFocusPoint({ x: 50, y: 50 });
  };

  const handleTriggerShutter = () => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 240);
  };

  // Load user approved stats from localStorage or real database counts
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("LTD_APPROVED_STATS");
      if (saved) {
        const parsed = JSON.parse(saved);
        setStats(parsed);
        setEditForm(parsed);
      } else {
        Promise.all([
          fetch("/api/content").then((r) => r.json()).catch(() => ({ total: 0 })),
          fetch("/api/ideas").then((r) => r.json()).catch(() => ({ total: 0 })),
          fetch("/api/members").then((r) => r.json()).catch(() => ({ counts: {} })),
        ]).then(([contentRes, ideasRes, membersRes]) => {
          if (contentRes?.total || membersRes?.counts?.total) {
            const dynamicStats: ClubStats = {
              ...DEFAULT_APPROVED_STATS,
              contentCount: contentRes?.total ?? DEFAULT_APPROVED_STATS.contentCount,
              ideasCount: ideasRes?.total ?? DEFAULT_APPROVED_STATS.ideasCount,
              membersCount: membersRes?.counts?.total ?? DEFAULT_APPROVED_STATS.membersCount,
              deptCommCount: membersRes?.counts?.COMM ?? DEFAULT_APPROVED_STATS.deptCommCount,
              deptTechCount: membersRes?.counts?.TECH ?? DEFAULT_APPROVED_STATS.deptTechCount,
            };
            setStats(dynamicStats);
            setEditForm(dynamicStats);
          }
        });
      }
    } catch {}
  }, []);

  const handleSaveStats = (e: React.FormEvent) => {
    e.preventDefault();
    setStats(editForm);
    try {
      localStorage.setItem("LTD_APPROVED_STATS", JSON.stringify(editForm));
    } catch {}
    setIsEditingStats(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleResetToRealData = async () => {
    try {
      localStorage.removeItem("LTD_APPROVED_STATS");
      const [contentRes, ideasRes, membersRes] = await Promise.all([
        fetch("/api/content").then((r) => r.json()).catch(() => ({ total: 0 })),
        fetch("/api/ideas").then((r) => r.json()).catch(() => ({ total: 0 })),
        fetch("/api/members").then((r) => r.json()).catch(() => ({ counts: {} })),
      ]);

      const resetStats: ClubStats = {
        contentCount: contentRes?.total || 0,
        contentTrend: "+0%",
        ideasCount: ideasRes?.total || 0,
        ideasTrend: "+0%",
        videoCount: 0,
        videoTrend: "+0%",
        membersCount: membersRes?.counts?.total || 0,
        membersTrend: "+0%",
        deptCommCount: membersRes?.counts?.COMM || 0,
        deptTechCount: membersRes?.counts?.TECH || 0,
      };

      setStats(resetStats);
      setEditForm(resetStats);
      setIsEditingStats(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch {}
  };

  // =========================================================================
  // VIEW MODE 1: CINEMATIC SHOWCASE & LANDING PAGE (MATCHING IMAGES 2 & 3)
  // =========================================================================
  if (viewMode === "cinematic") {
    return (
      <div className="relative min-h-screen bg-[#070b0e] text-white overflow-hidden pb-24 selection:bg-cyan-500 selection:text-black">
        {/* Subtle Ambient Photography Environment Texture & Glowing Orbs */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-screen pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        {/* Dark radial gradients and bokeh */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[550px] h-[550px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] rounded-full bg-amber-600/10 blur-[130px] pointer-events-none" />

        {/* 1. FLOATING CINEMATIC NAVIGATION BAR (Image 2 style) */}
        <nav className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 pt-5">
          <div className="flex items-center justify-between px-5 sm:px-7 py-3 rounded-full bg-[#0c1219]/80 backdrop-blur-2xl border border-white/10 shadow-2xl">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 p-[1.5px] shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#091322] rounded-[10px] flex items-center justify-center p-1">
                  <img src="/logo.png" alt="LTD Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-wider text-white">LTD</span>
                  <span className="font-semibold text-xs text-slate-300">Creative Studio</span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    v2.0
                  </span>
                </div>
              </div>
            </Link>

            {/* Center Navigation Links (Hidden on small screens) */}
            <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
              <a href="#tools" className="hover:text-cyan-400 transition-colors">
                Trợ Lý AI
              </a>
              <a href="#metrics" className="hover:text-cyan-400 transition-colors">
                Chỉ Số Hoạt Động
              </a>
              <a href="#departments" className="hover:text-cyan-400 transition-colors">
                Ban Chuyên Môn
              </a>
              <Link href="/members" className="hover:text-cyan-400 transition-colors">
                Danh Bạ Thành Viên
              </Link>
              <Link href="/calendar" className="hover:text-cyan-400 transition-colors">
                Lịch Realtime
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Button to toggle to classic Workspace Dashboard */}
              <button
                onClick={() => setViewMode("workspace")}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95"
                title="Mở Bàn Làm Việc dạng bảng điều khiển quản trị"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Bàn Làm Việc 📊</span>
              </button>

              <Link
                href="/writer"
                className="embers-btn flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-950 hover:bg-cyan-300 text-xs font-extrabold shadow-lg shadow-white/10 transition-all active:scale-95"
              >
                <span>Khám Phá Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </nav>

        {/* 2. HERO SHOWCASE SECTION (HIGH-IMPACT EDITORIAL & INTERACTIVE 3D VIEWFINDER) */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left 6 Columns: Poetic, Concise, Human-Centric Photography Copy */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Status pill badge with personalized member info */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-[11px] font-bold text-slate-200 tracking-wider">
                  CLB Nhiếp Ảnh LTD • Xin chào, <span className="text-cyan-300 font-extrabold">{profile?.displayName || "Đỗ Quốc Thảo"}</span> ({profile?.role || "Chủ tịch CLB"} — {profile?.department || "Ban Kỹ thuật"})
                </span>
              </div>

              {/* Poetic & Punchy Editorial Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-white leading-[1.18]">
                Kể câu chuyện của bạn <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-300">
                  qua từng khung hình
                </span>
              </h1>

              {/* Concise, warm, human-like photography subtext */}
              <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-lg font-normal">
                Không gian sáng tạo của CLB Nhiếp Ảnh Long Thành. Nơi AI đồng hành cùng bạn viết caption cảm xúc, lên kịch bản và hoàn thiện từng thước phim đẹp nhất.
              </p>

              {/* Dual Action CTA Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/writer"
                  className="embers-btn inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 hover:bg-cyan-300 font-extrabold text-xs shadow-xl shadow-cyan-500/20 group transition-all"
                >
                  <Sparkles className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />
                  <span>Khám Phá Studio Ngay</span>
                </Link>

                <button
                  onClick={() => setShowShowreelModal(true)}
                  className="embers-btn inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/15 backdrop-blur-md text-xs font-bold transition-all"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span>Xem Showreel CLB</span>
                </button>
              </div>

              {/* 3 Concise Trust Tags */}
              <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>29 Nhiếp ảnh gia &amp; KTV</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trợ Lý Gemini 3.5 Flash</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Realtime Sync</span>
                </div>
              </div>
            </div>

            {/* Right 6 Columns: 3D CYBER-OPTICS CAMERA VIEWFINDER & LIVE DARKROOM HUD (CỰC KỲ Ồ WAOO!) */}
            <div className="lg:col-span-6 relative perspective-1200">
              <div
                onMouseMove={handleViewfinderMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                  transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className="relative rounded-3xl bg-[#090f17]/95 border border-white/20 p-4 shadow-2xl shadow-cyan-950/60 backdrop-blur-2xl transition-all duration-300 group hover:border-cyan-400/50 select-none"
              >
                {/* 1. Camera Chassis Top Metadata Bar */}
                <div className="flex items-center justify-between pb-3 px-1 text-[11px] font-mono text-slate-400 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
                    <span className="font-bold text-white tracking-wider">● REC 00:24:19:08</span>
                    <span className="hidden sm:inline text-slate-500">|</span>
                    <span className="hidden sm:inline text-cyan-300">RAW 14-BIT S-LOG3</span>
                  </div>
                  <div className="flex items-center gap-3 font-semibold">
                    <span className="text-amber-400">4K 60FPS</span>
                    <span className="text-emerald-400">98% ⚡</span>
                  </div>
                </div>

                {/* 2. Interactive Camera Viewfinder Display */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black mt-3 border border-white/15 cursor-crosshair group/viewfinder">
                  {/* Active Photograph depending on Lens Mode */}
                  <img
                    src={
                      lensMode === "portrait"
                        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80"
                        : lensMode === "landscape"
                        ? "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
                        : "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt="LTD Viewfinder Artwork"
                    className="w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/viewfinder:scale-105"
                  />

                  {/* Shutter Flash Effect */}
                  {shutterFlash && (
                    <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
                  )}

                  {/* Optical Lens Vignette & Grading Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                  {/* 3. Rule of Thirds Grid Lines (Appears subtly on hover) */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20 group-hover/viewfinder:opacity-45 transition-opacity">
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-white" />
                    <div className="border-r border-white" />
                    <div className="" />
                  </div>

                  {/* 4. Four Corner Framing Brackets */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/80 pointer-events-none" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/80 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/80 pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/80 pointer-events-none" />

                  {/* 5. DYNAMIC MOUSE-TRACKING AUTOFOCUS RETICLE [ + ] (ĐỈNH CAO TƯƠNG TÁC) */}
                  <div
                    style={{
                      left: `${focusPoint.x}%`,
                      top: `${focusPoint.y}%`,
                      transform: "translate(-50%, -50%)",
                      transition: "left 0.08s ease-out, top 0.08s ease-out",
                    }}
                    className="absolute pointer-events-none z-20 flex flex-col items-center"
                  >
                    <div className="relative w-12 h-12 border border-lime-400/90 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(163,230,53,0.8)]">
                      <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-ping" />
                      <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-lime-400" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-lime-400" />
                      <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-lime-400" />
                      <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-lime-400" />
                    </div>
                    <span className="mt-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-black/80 text-lime-300 border border-lime-400/40 whitespace-nowrap">
                      AF-C EYE [LOCKED]
                    </span>
                  </div>

                  {/* Live Exposure Strip in Viewfinder bottom */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono font-bold text-white z-20 drop-shadow">
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-300">
                        {lensMode === "portrait"
                          ? "f/1.4 GM · 85mm"
                          : lensMode === "landscape"
                          ? "f/8.0 G · 24mm"
                          : "T2.0 CINE · 35mm"}
                      </span>
                      <span>
                        {lensMode === "portrait"
                          ? "1/1600s"
                          : lensMode === "landscape"
                          ? "1/250s"
                          : "1/50s (180°)"}
                      </span>
                      <span className="text-amber-300">
                        {lensMode === "portrait"
                          ? "ISO 100"
                          : lensMode === "landscape"
                          ? "ISO 64"
                          : "ISO 400"}
                      </span>
                    </div>
                    <span className="text-emerald-400">EV +0.0</span>
                  </div>
                </div>

                {/* 3. Interactive Photography Controls Bar (Dưới Viewfinder) */}
                <div className="pt-3.5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Lens Mode Switcher Pills */}
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
                      <button
                        onClick={() => setLensMode("portrait")}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                          lensMode === "portrait"
                            ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        🎯 f/1.4 Chân dung
                      </button>
                      <button
                        onClick={() => setLensMode("landscape")}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                          lensMode === "landscape"
                            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        🌅 f/8 Phong cảnh
                      </button>
                      <button
                        onClick={() => setLensMode("cinema")}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                          lensMode === "cinema"
                            ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        🎬 24fps Điện ảnh
                      </button>
                    </div>

                    {/* Tactile Camera Shutter Button */}
                    <button
                      onClick={handleTriggerShutter}
                      className="embers-btn flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-rose-500/30 active:scale-95 transition-all"
                      title="Nhấn để chụp thử và trải nghiệm hiệu ứng flash màn trập"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Bấm Chụp Thử</span>
                    </button>
                  </div>

                  {/* Mode explanation label */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                    <span>
                      {lensMode === "portrait"
                        ? "✨ Chế độ chân dung: Xóa phông mượt mà với khẩu độ f/1.4"
                        : lensMode === "landscape"
                        ? "✨ Chế độ phong cảnh: Siêu sắc nét từ tiền cảnh đến vô cực"
                        : "✨ Chế độ điện ảnh: Chuẩn 24fps cinematic với tỷ lệ màn ảnh rộng"}
                    </span>
                    <span className="text-cyan-400 font-bold">Rê chuột để dò nét 3D</span>
                  </div>
                </div>

                {/* 4. Floating Holographic Match Ring (Image 3 style) */}
                <div className="absolute -top-4 -right-4 p-3 rounded-2xl bg-[#09101a]/95 border border-cyan-400/40 shadow-xl shadow-cyan-500/25 flex items-center gap-2.5 backdrop-blur-md">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="3.5"
                        strokeDasharray="99, 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute font-extrabold text-[11px] text-cyan-300">99%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                      Độ Nét
                    </span>
                    <span className="text-xs font-extrabold text-white">Full-Frame 61MP</span>
                  </div>
                </div>

                {/* 5. Floating Bottom-Left Color Grade LUT pill */}
                <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#09101a]/95 border border-amber-400/40 shadow-xl shadow-amber-500/15 backdrop-blur-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <div className="text-[11px] font-mono">
                    <span className="text-slate-400">Color Profile: </span>
                    <span className="font-bold text-amber-300">LTD Golden Hour LUT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TOOL MATRIX: 3 DARK-GLASS LUXURY CARDS WITH NEON MATCH RINGS (IMAGE 3 NOVA STYLE) */}
        <section id="tools" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase">
                Bộ Công Cụ AI Cốt Lõi
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Trợ Lý Sáng Tạo Cho 2 Ban Chuyên Môn
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Tích hợp sẵn các thuật toán tối ưu cho nghệ thuật nhiếp ảnh, giúp hội viên hoàn thiện sản phẩm nhanh gấp 10 lần.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: AI CONTENT WRITER */}
            <div className="embers-card relative rounded-3xl bg-[#0c131c]/90 border border-white/10 p-6 flex flex-col justify-between group hover:border-cyan-400/50 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 group-hover:scale-105 transition-transform">
                    <PenSquare className="w-6 h-6" />
                  </div>
                  {/* Neon Match Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="3.5"
                        strokeDasharray="98, 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute font-extrabold text-xs text-cyan-300">98%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                      Ban Truyền thông
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    AI Content Writer
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Soạn thảo caption bộ ảnh, bài đăng Facebook, kịch bản ngắn TikTok 9:16 và bài truyền thông không bịa đặt dữ kiện.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">5 Nền tảng · 5 Giọng văn</span>
                <Link
                  href="/writer"
                  className="embers-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  <span>Mở Trình Viết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* CARD 2: AI CREATIVE DIRECTOR */}
            <div className="embers-card relative rounded-3xl bg-[#0c131c]/90 border border-white/10 p-6 flex flex-col justify-between group hover:border-lime-400/50 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-lime-500/10 text-lime-400 border border-lime-400/20 group-hover:scale-105 transition-transform">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  {/* Neon Match Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#a3e635"
                        strokeWidth="3.5"
                        strokeDasharray="95, 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute font-extrabold text-xs text-lime-300">95%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-500/20 text-lime-300">
                      Chiến Dịch &amp; Góc Máy
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-lime-300 transition-colors">
                    AI Creative Director
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Xây dựng lộ trình truyền thông 14 ngày, ý tưởng triển lãm ảnh và phân bổ góc máy visual direction cho ban kỹ thuật.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">14-Day Blueprint · Visual</span>
                <Link
                  href="/director"
                  className="embers-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20"
                >
                  <span>Lên Ý Tưởng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* CARD 3: AI VIDEO EDITOR */}
            <div className="embers-card relative rounded-3xl bg-[#0c131c]/90 border border-white/10 p-6 flex flex-col justify-between group hover:border-emerald-400/50 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 group-hover:scale-105 transition-transform">
                    <Clapperboard className="w-6 h-6" />
                  </div>
                  {/* Neon Match Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        strokeDasharray="100, 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute font-extrabold text-xs text-emerald-300">100%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      Ban Kỹ thuật
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    AI Video Editor
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Hậu kỳ clip dọc TikTok/Reels thông minh, phân tích beat nhạc, cắt ghép tự động và render video chuẩn điện ảnh.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">9:16 Vertical · FFmpeg</span>
                <Link
                  href="/video"
                  className="embers-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  <span>Dựng Video</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. LIVE METRICS SHELF & REALTIME DATABASE SYNC (IMAGE 3 NOVA INDEX STYLE) */}
        <section id="metrics" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="rounded-3xl bg-[#0c1219]/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Chỉ Số Hoạt Động Thời Gian Thực</h3>
                  <p className="text-xs text-slate-400 font-mono">Firebase Realtime Sync: Connected</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditingStats(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                <span>Duyệt &amp; Điều chỉnh số liệu CLB</span>
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Nội dung đã duyệt</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">{stats.contentCount}</span>
                  <span className="text-xs text-emerald-400 font-bold">{stats.contentTrend}</span>
                </div>
                <p className="text-[11px] text-slate-500">Bài viết, caption &amp; kịch bản</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Ý tưởng chiến dịch</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">{stats.ideasCount}</span>
                  <span className="text-xs text-emerald-400 font-bold">{stats.ideasTrend}</span>
                </div>
                <p className="text-[11px] text-slate-500">Kế hoạch truyền thông 14 ngày</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Video đã render</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">{stats.videoCount}</span>
                  <span className="text-xs text-emerald-400 font-bold">{stats.videoTrend}</span>
                </div>
                <p className="text-[11px] text-slate-500">Recap workshop &amp; reels</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Tổng thành viên LTD</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">{stats.membersCount}</span>
                  <span className="text-xs text-emerald-400 font-bold">{stats.membersTrend}</span>
                </div>
                <p className="text-[11px] text-slate-500">{stats.deptCommCount} Truyền thông · {stats.deptTechCount} Kỹ thuật</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SHOWREEL MODAL */}
        {showShowreelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl rounded-3xl bg-[#09121d] border border-white/20 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-extrabold text-base text-white">Showreel CLB Nhiếp Ảnh LTD 2026</h3>
                </div>
                <button
                  onClick={() => setShowShowreelModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative flex items-center justify-center border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80"
                  alt="Showreel preview"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/40 hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-7 h-7 fill-slate-950 ml-1" />
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    Hành trình sáng tạo nghệ thuật của CLB Nhiếp Ảnh Long Thành Digital
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. MODAL CHỈNH SỬA SỐ LIỆU CLB */}
        {isEditingStats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <div className="w-full max-w-xl rounded-3xl bg-[#0c1420] border border-white/20 p-6 sm:p-7 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-cyan-400" />
                    <span>Duyệt &amp; Điều Chỉnh Số Liệu CLB LTD</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Số liệu thực tế chính thức của câu lạc bộ được lưu giữ an toàn.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingStats(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStats} className="space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Nội dung đã tạo</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.contentCount}
                      onChange={(e) => setEditForm({ ...editForm, contentCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Ý tưởng mới</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.ideasCount}
                      onChange={(e) => setEditForm({ ...editForm, ideasCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Video đã render</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.videoCount}
                      onChange={(e) => setEditForm({ ...editForm, videoCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tổng thành viên</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.membersCount}
                      onChange={(e) => setEditForm({ ...editForm, membersCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Số lượng thành viên từng ban</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Ban Truyền thông</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.deptCommCount}
                        onChange={(e) => setEditForm({ ...editForm, deptCommCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Ban Kỹ thuật</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.deptTechCount}
                        onChange={(e) => setEditForm({ ...editForm, deptTechCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResetToRealData}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục DB thật</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingStats(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu &amp; Phê Duyệt</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: CLASSIC ADMINISTRATIVE WORKSPACE DASHBOARD (IMAGE 1)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f0f4fa] text-slate-900 p-4 sm:p-6 space-y-6">
      {/* Switcher Banner to return to Cinematic Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-[#091322] text-white shadow-lg border border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <div>
            <span className="text-xs font-bold text-white block">
              Chế độ: Bàn Làm Việc Quản Trị (Workspace Dashboard)
            </span>
            <span className="text-[11px] text-slate-400">
              Quản lý số liệu, duyệt bài viết và lịch trình câu lạc bộ
            </span>
          </div>
        </div>
        <button
          onClick={() => setViewMode("cinematic")}
          className="embers-btn px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>✨ Mở Trang Chủ Điện Ảnh (Cinematic Hub)</span>
        </button>
      </div>

      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-blue-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>Đã lưu và phê duyệt số liệu thành công!</span>
        </div>
      )}

      {/* 2-Column Responsive Layout Matching Reference Image (Left 8 Cols, Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT MAIN COLUMN (8/12) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. HERO BANNER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07111e] via-[#0d1d36] to-[#152a4e] border border-blue-900/50 p-7 sm:p-9 text-white shadow-xl min-h-[250px] flex flex-col justify-between ember-stagger-1 transition-all duration-500">
            <div
              className="absolute inset-0 bg-cover bg-right opacity-35 mix-blend-luminosity pointer-events-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80')",
              }}
            />
            <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-10 right-0 w-80 h-80 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 text-white">
                <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Sparkles className="w-4 h-4 fill-cyan-400" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  LTD Creative Studio
                </h1>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-cyan-200">
                  <span>👋 Chào mừng,</span>
                  <span className="font-extrabold text-white">{profile?.displayName || "Đỗ Quốc Thảo"}</span>
                  <span className="text-white/70">({profile?.role || "Chủ tịch"} • {profile?.department || "Ban Kỹ thuật"})</span>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-white tracking-tight">
                Nền tảng AI đồng hành cùng CLB Nhiếp Ảnh LTD
              </h2>

              <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-md pt-1">
                Sáng tạo nội dung, lan tỏa đam mê, cùng nhau ghi lại những khoảnh khắc đẹp nhất.
              </p>

              <div className="pt-3">
                <Link
                  href="/writer"
                  className="embers-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg hover:shadow-cyan-500/20 group"
                >
                  <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600 group-hover:scale-110 transition-transform" />
                  <span>Khám phá ngay</span>
                </Link>
              </div>
            </div>

            <div className="hidden sm:block absolute right-8 bottom-6 text-right pointer-events-none select-none z-10">
              <span
                className="text-lg md:text-xl font-serif italic text-white/50 tracking-wide block"
                style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive, serif" }}
              >
                Long Thành
              </span>
              <span
                className="text-sm font-serif italic text-white/40 tracking-wider block -mt-1"
                style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive, serif" }}
              >
                Digital Photo Club
              </span>
            </div>
          </div>

          {/* 2. STATS OVERVIEW CARDS */}
          <div className="space-y-2 ember-stagger-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Chỉ số hoạt động
              </span>
              <button
                onClick={() => setIsEditingStats(true)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <Settings className="w-3 h-3" />
                <span>Duyệt &amp; Điều chỉnh số liệu</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="embers-card relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                    ↑ {stats.contentTrend}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900">{stats.contentCount}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Nội dung đã tạo</div>
                </div>
              </div>

              <div className="embers-card relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                    ↑ {stats.ideasTrend}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900">{stats.ideasCount}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Ý tưởng mới</div>
                </div>
              </div>

              <div className="embers-card relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
                    <Clapperboard className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                    ↑ {stats.videoTrend}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900">{stats.videoCount}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Video đã render</div>
                </div>
              </div>

              <div className="embers-card relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                    ↑ {stats.membersTrend}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900">{stats.membersCount}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Thành viên LTD</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. TRỢ LÝ AI WORKSPACES */}
          <div className="space-y-3 ember-stagger-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-lg">☆</span>
                <h3 className="font-bold text-sm text-slate-900">Trợ lý AI của bạn</h3>
              </div>
              <Link
                href="/writer"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div className="embers-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ebf3ff] via-white to-[#f0f7ff] border border-blue-100/90 p-5 shadow-sm flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                      <PenSquare className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                      Truyền thông
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      AI Content Writer
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Viết caption, bài đăng, thông báo chuẩn phong cách LTD.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-end justify-between">
                  <Link
                    href="/writer"
                    className="embers-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-sm"
                  >
                    <span>Bắt đầu ngay</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="embers-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f5edff] via-white to-[#fbf7ff] border border-purple-100/90 p-5 shadow-sm flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
                      Sáng tạo
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                      AI Creative Director
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Brainstorm ý tưởng, xây dựng chiến dịch và kế hoạch nội dung.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-end justify-between">
                  <Link
                    href="/director"
                    className="embers-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] shadow-sm"
                  >
                    <span>Bắt đầu ngay</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="embers-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e6fbf7] via-white to-[#f0fdfa] border border-teal-100/90 p-5 shadow-sm flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                      <Clapperboard className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                      Hậu kỳ
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                      AI Video Editor
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Dựng video thông minh, tạo video chất lượng cao.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-end justify-between">
                  <Link
                    href="/video"
                    className="embers-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-sm"
                  >
                    <span>Bắt đầu ngay</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="embers-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e0f7fa] via-white to-[#f0fdf4] border border-cyan-100/90 p-5 shadow-sm flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                      <Palette className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-100 text-cyan-700">
                      Đồ họa
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-cyan-600 transition-colors">
                      AI Design Studio
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Thiết kế poster, banner sự kiện kiểu Canva, sinh ảnh AI.
                    </p>
                  </div>
                </div>
                <div className="pt-4 flex items-end justify-between">
                  <Link
                    href="/design"
                    className="embers-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-[11px] shadow-sm"
                  >
                    <span>Bắt đầu ngay</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 4. BAN CHUYÊN MÔN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Thành viên LTD</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 ember-stagger-4">
              <Link
                href="/members?dept=COMM"
                className="embers-card group p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-left flex items-center gap-4"
              >
                <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80"
                    alt="Ban Truyền thông"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate">Ban Truyền thông</p>
                      <p className="text-[11px] text-blue-600 font-semibold">{stats.deptCommCount} thành viên</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link
                href="/members?dept=TECH"
                className="embers-card group p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-left flex items-center gap-4"
              >
                <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80"
                    alt="Ban Kỹ thuật"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate">Ban Kỹ thuật</p>
                      <p className="text-[11px] text-purple-600 font-semibold">{stats.deptTechCount} thành viên</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ================= RIGHT WIDGETS COLUMN (4/12) ================= */}
        <div className="lg:col-span-4 space-y-6">
          <RealtimeCalendarWidget />

          <div className="embers-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07101c] via-[#0d1829] to-[#060c16] text-white p-6 shadow-xl border border-cyan-900/30 group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none group-hover:scale-105 transition-transform duration-700"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80')",
              }}
            />
            <div className="relative z-10 space-y-3">
              <div className="text-cyan-400 text-3xl font-serif leading-none opacity-85">❝</div>
              <p className="text-xs leading-relaxed text-slate-200/90 font-medium">
                Chụp ảnh không chỉ là lưu giữ khoảnh khắc, mà còn là cách chúng ta kể những câu chuyện.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <span className="text-xs text-slate-400 font-semibold">— LTD</span>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <img src="/logo.png" alt="LTD Logo" className="w-4 h-4 object-contain brightness-125" />
                  <span className="text-xs font-bold text-white tracking-wider">LTD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DUYỆT SỐ LIỆU */}
      {isEditingStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <span>Duyệt &amp; Điều Chỉnh Số Liệu CLB LTD</span>
              </h3>
              <button onClick={() => setIsEditingStats(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStats} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nội dung đã tạo</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.contentCount}
                    onChange={(e) => setEditForm({ ...editForm, contentCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ý tưởng mới</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.ideasCount}
                    onChange={(e) => setEditForm({ ...editForm, ideasCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Lưu &amp; Phê Duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
