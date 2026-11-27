"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  Lightbulb,
  Clapperboard,
  CalendarDays,
  Image as ImageIcon,
  Users,
  FolderKanban,
  Settings,
  Palette,
  Menu,
  X,
  ChevronRight,
  LogOut,
  LogIn,
  ShieldCheck,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { UserProfileModal } from "@/components/layout/user-profile-modal";

const mainMenuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "AI Content Writer", href: "/writer", icon: PenSquare },
  { name: "AI Creative Director", href: "/director", icon: Lightbulb },
  { name: "AI Video Editor", href: "/video", icon: Clapperboard },
  { name: "AI Design Studio", href: "/design", icon: Palette },
];

const secondaryMenuItems = [
  { name: "Kho bài mẫu AI", href: "/knowledge", icon: Database },
  { name: "Lịch nội dung", href: "/calendar", icon: CalendarDays },
  { name: "Thư viện LTD", href: "/library", icon: ImageIcon },
  { name: "Danh sách thành viên", href: "/members", icon: Users },
  { name: "Dự án của tôi", href: "/projects", icon: FolderKanban },
  { name: "Điều khoản & Bảo mật", href: "/terms", icon: ShieldCheck },
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [profileModalOpen, setProfileModalOpen] = React.useState(false);
  const { profile, user, logout } = useAuth();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-[#091322] text-white shadow-lg border border-slate-700/60"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Fixed Navy Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col bg-[#091322] border-r border-[#12213a] text-white transition-transform duration-300 ease-in-out select-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="pt-6 pb-4 px-5">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Official LTD Club Logo with subtle breathing glow */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 group-hover:shadow-cyan-400/40 transition-all duration-300 shrink-0">
              <div className="w-full h-full bg-[#091322] rounded-[10px] flex items-center justify-center overflow-hidden p-1">
                <img
                  src="/logo.png"
                  alt="CLB Nhiếp Ảnh LTD"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-extrabold text-base tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                  LTD
                </span>
                <span className="font-semibold text-sm text-slate-200">
                  Creative Studio
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Create · Connect · Inspire
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-4 scrollbar-none">
          {/* Main 4 AI Apps */}
          <nav className="space-y-1">
            {mainMenuItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-600/35 translate-x-1"
                      : "text-slate-300 hover:text-white hover:bg-[#12213a]/80 hover:translate-x-1"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  )}
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-300",
                      isActive ? "text-white scale-110" : "text-slate-400 group-hover:text-white"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent mx-2" />

          {/* Secondary Club Apps */}
          <nav className="space-y-1">
            {secondaryMenuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-600/35 translate-x-1"
                      : "text-slate-300 hover:text-white hover:bg-[#12213a]/80 hover:translate-x-1"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  )}
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-300",
                      isActive ? "text-white scale-110" : "text-slate-400"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Matching Reference (Click to upload avatar / edit profile) */}
        <div className="p-3 border-t border-[#12213a] bg-[#070e1a]/80 flex items-center justify-between">
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 p-1 rounded-xl hover:bg-[#12213a] transition-colors group text-left cursor-pointer"
            title="Đổi ảnh đại diện & chỉnh sửa hồ sơ cá nhân"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-400/50 shrink-0 bg-slate-700">
              <img
                src={
                  profile?.photoURL ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                }
                alt={profile?.displayName || "User"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#091322]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                {profile?.displayName || "Đỗ Quốc Thảo"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {profile?.role || "Chủ tịch CLB"} · {profile?.department || "Ban Kỹ thuật"}
              </p>
            </div>
          </button>

          {user ? (
            <button
              onClick={() => logout()}
              title="Đăng xuất Firebase"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-[#12213a] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/login"
              title="Cổng đăng nhập Firebase"
              className="p-1.5 rounded-lg text-cyan-400 hover:bg-[#12213a] transition-colors"
            >
              <LogIn className="w-4 h-4" />
            </Link>
          )}
        </div>
      </aside>

      {/* User Profile & Avatar Upload Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
