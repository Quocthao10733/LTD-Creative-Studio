"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Bell, User as UserIcon, LogIn, Camera, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { UserProfileModal } from "@/components/layout/user-profile-modal";

function ApertureMiniIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      style={{ width: "16px", height: "16px" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
      <line x1="9.69" y1="8" x2="21.17" y2="8" />
      <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
      <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
      <line x1="14.31" y1="16" x2="2.83" y2="16" />
      <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
    </svg>
  );
}

export function Header() {
  const { user, profile } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-[#f4f7fc]/85 dark:bg-[#090f18]/85 backdrop-blur-xl transition-all duration-300">
        {/* Search Input Bar (Pill style matching screenshot) */}
        <div className="flex-1 max-w-xl pl-14 sm:pl-16 lg:pl-0">
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Tìm kiếm công cụ, dự án, thành viên... (Ctrl + K)"
              className="w-full pl-11 pr-14 py-2.5 rounded-full bg-white/90 dark:bg-[#0d1522] border border-slate-200/90 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:focus:ring-cyan-500/25 focus:border-blue-500 dark:focus:border-cyan-500 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:shadow-md"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded absolute right-3.5 top-1/2 -translate-y-1/2">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side: Theme Switcher, Notifications & Club Pill */}
        <div className="flex items-center gap-2.5">
          {/* Global Light / Dark Theme Switcher Button */}
          <ThemeToggle />

          {/* Notification Bell */}
          <button
            className="relative p-2.5 rounded-full bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:border-blue-200 dark:hover:border-cyan-500/40 hover:shadow-md shadow-sm transition-all duration-200 active:scale-95"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
              3
            </span>
          </button>

          {/* Club Pill Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0d1522] border border-slate-200/90 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-800 dark:text-slate-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 select-none">
            <div className="relative flex items-center justify-center">
              <img
                src="/logo.png"
                alt="CLB Nhiếp Ảnh LTD"
                className="w-4 h-4 object-contain rounded-full"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900 animate-pulse" />
            </div>
            <span className="text-[11px] font-bold tracking-tight">Long Thành Digital Photo Club</span>
          </div>

          {/* User Profile & Avatar Pill (Click to open Profile Modal & Upload Photo) */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#0d1522] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-cyan-400 hover:shadow-md transition-all text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95"
            title="Nhấn để đổi ảnh cá nhân & hồ sơ"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden bg-blue-100 dark:bg-slate-800 ring-2 ring-blue-500/30 group-hover:ring-blue-500 flex items-center justify-center transition-all">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile?.displayName || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold">
                  {profile?.displayName?.charAt(0) || "U"}
                </span>
              )}
              {/* Little camera badge overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>

            <span className="hidden md:inline text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
              {profile?.displayName || "Đỗ Quốc Thảo"}
            </span>

            <span className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-900">
              {profile?.department === "Ban Kỹ thuật" ? "Kỹ thuật" : "Truyền thông"}
            </span>
          </button>
        </div>
      </header>

      {/* User Profile & Avatar Upload Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
