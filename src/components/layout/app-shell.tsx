"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import { useAuth } from "@/context/auth-context";

// Các route công khai không cần đăng nhập
const PUBLIC_ROUTES = ["/", "/login", "/terms"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  // Người dùng "thật" = có Firebase user HOẶC có profile local (không phải demo mặc định)
  const isLoggedIn =
    !!user ||
    (!!profile && profile.uid !== "ltd-default-admin" && !!profile.displayName);

  React.useEffect(() => {
    if (!loading && !isPublic && !isLoggedIn) {
      router.replace("/login");
    }
  }, [loading, isPublic, isLoggedIn, router]);

  // Trang chủ: fullscreen cinematic, không cần sidebar
  if (pathname === "/") {
    return (
      <div className="min-h-screen bg-[#070b0e] text-white selection:bg-cyan-500 selection:text-black font-sans antialiased">
        <PageTransition>{children}</PageTransition>
      </div>
    );
  }

  // Trang login / terms: layout riêng, không có sidebar
  if (isPublic) {
    return (
      <div className="min-h-screen bg-[#f0f4fa] dark:bg-[#070b10] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {children}
      </div>
    );
  }

  // Đang kiểm tra auth — hiển thị màn hình chờ
  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#070b10] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
            <svg
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            Đang tải LTD Creative Studio…
          </p>
        </div>
      </div>
    );
  }

  // Workspace layout cho các route nội bộ (đã đăng nhập)
  return (
    <div className="flex min-h-screen bg-[#f0f4fa] dark:bg-[#070b10] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Left Navy Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen bg-[#f0f4fa] dark:bg-[#070b10] transition-colors duration-300">
        <Header />
        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-[1600px] w-full mx-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
