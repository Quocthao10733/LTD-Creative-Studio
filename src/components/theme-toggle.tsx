"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-transparent animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Chuyển sang giao diện Sáng (Light Mode)" : "Chuyển sang giao diện Tối (Dark Mode)"}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#0d1522] text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-300 shadow-sm active:scale-95 text-xs font-semibold select-none group"
      aria-label="Chuyển chế độ Sáng / Tối"
    >
      {isDark ? (
        <>
          <Moon className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-[11px] font-medium text-slate-300">Tối</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-45 transition-transform duration-300" />
          <span className="text-[11px] font-medium text-slate-700">Sáng</span>
        </>
      )}
    </button>
  );
}
