"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // If on home page: Full-width edge-to-edge cinematic canvas (Images 2 & 3)
  if (isHomePage) {
    return (
      <div className="min-h-screen bg-[#070b0e] text-white selection:bg-cyan-500 selection:text-black font-sans antialiased">
        <PageTransition>{children}</PageTransition>
      </div>
    );
  }

  // Normal Workspace layout for all tool routes (/writer, /director, /video, /members, /calendar, /settings)
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
