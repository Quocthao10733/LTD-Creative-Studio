"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban, Plus, Clock, Video, FileText, Sparkles } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            <span>Dự Án Của Tôi</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý các chiến dịch truyền thông, bài đăng và dự án video đang thực hiện
          </p>
        </div>

        <Link
          href="/writer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Dự Án Mới</span>
        </Link>
      </div>

      <div className="p-16 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
          <FolderKanban className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-base text-slate-900 dark:text-white">
            Chưa có dự án nào đang mở
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Bắt đầu tạo bài viết với <Link href="/writer" className="text-blue-600 underline font-semibold">AI Content Writer</Link> hoặc dựng video với <Link href="/video" className="text-teal-600 underline font-semibold">AI Video Editor</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
