"use client";

import * as React from "react";
import Link from "next/link";
import {
  Lightbulb,
  Sparkles,
  Compass,
  ArrowRight,
  Calendar,
  Camera,
  Layers,
  Wand2,
  Check,
  AlertTriangle,
  FolderPlus,
  BookmarkCheck,
  Clock,
  Sliders,
  Send,
  Trash2,
  Palette,
} from "lucide-react";
import { IdeaCard } from "@/lib/types/director";
import { useAuth } from "@/context/auth-context";
import { getStoredGeminiModel } from "@/lib/ai/models";

export default function DirectorPage() {
  const { profile } = useAuth();
  const [topic, setTopic] = React.useState("");
  const [focusArea, setFocusArea] = React.useState("all");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [ideas, setIdeas] = React.useState<IdeaCard[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);
  const [schedulingId, setSchedulingId] = React.useState<string | null>(null);

  // Load previously saved ideas on mount
  React.useEffect(() => {
    async function loadSavedIdeas() {
      try {
        const res = await fetch("/api/ideas");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setIdeas(json.data);
        }
      } catch (err) {
        console.error("Lỗi tải ý tưởng:", err);
      }
    }
    loadSavedIdeas();
  }, []);

  const handleBrainstorm = async () => {
    if (!topic.trim()) {
      setErrorMessage("Vui lòng nhập chủ đề bạn muốn AI brainstorm!");
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          focusArea: focusArea === "all" ? "" : focusArea,
          model: getStoredGeminiModel(),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setIdeas(json.data);
        // Automatically save to ideas database
        for (const idea of json.data) {
          await fetch("/api/ideas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(idea),
          });
        }
        setSuccessToast(`Đã sinh và lưu ${json.data.length} concept ý tưởng mới!`);
        setTimeout(() => setSuccessToast(null), 3500);
      } else {
        setErrorMessage(json.error || "Không thể sinh ý tưởng. Vui lòng thử lại!");
      }
    } catch (err: any) {
      setErrorMessage("Lỗi kết nối khi gọi AI Creative Director: " + (err.message || ""));
    } finally {
      setIsGenerating(false);
    }
  };

  // Add Idea into Content Calendar directly
  const handleAddToCalendar = async (idea: IdeaCard) => {
    setSchedulingId(idea.id);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          date: "2026-11-25", // Default scheduled in November 2026
          time: "14:00",
          type: idea.format.toLowerCase().includes("tiktok") ? "tiktok_video" : "workshop",
          department: "ALL",
          description: `${idea.bigIdea}\nShot list: ${idea.shotlist}\nThiết bị: ${idea.equipment}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessToast(`Đã đưa "${idea.title}" vào Lịch phát hành CLB!`);
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } catch {
      alert("Lỗi khi đưa ý tưởng vào lịch");
    } finally {
      setSchedulingId(null);
    }
  };

  // Delete single idea (when finished or dismissed)
  const handleDeleteIdea = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIdeas((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/ideas?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setSuccessToast("Đã xóa ý tưởng khỏi kho sáng tạo!");
      setTimeout(() => setSuccessToast(null), 2500);
    } catch (err) {
      console.error("Lỗi khi xóa ý tưởng:", err);
    }
  };

  // Clear all ideas
  const handleClearAllIdeas = async () => {
    if (ideas.length === 0) return;
    if (!window.confirm("Bạn có chắc chắn muốn dọn sạch tất cả ý tưởng trong danh sách này không?")) return;
    setIdeas([]);
    try {
      await fetch("/api/ideas?id=all", { method: "DELETE" });
      setSuccessToast("Đã dọn sạch toàn bộ ý tưởng!");
      setTimeout(() => setSuccessToast(null), 2500);
    } catch (err) {
      console.error("Lỗi khi dọn sạch ý tưởng:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-purple-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start justify-between gap-3 text-xs text-red-600 dark:text-red-400">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner with High Contrast Contrast In Both Modes */}
      <div className="relative overflow-hidden p-7 lg:p-9 rounded-3xl bg-gradient-to-r from-[#170e30] via-[#24174a] to-[#311c66] border border-purple-500/40 text-white shadow-xl">
        <div className="absolute top-0 right-10 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>AI CREATIVE STRATEGIST — PHIÊN CỦA {profile?.displayName ? profile.displayName.toUpperCase() : "ĐỖ QUỐC THẢO"} ({profile?.role || "CHỦ TỊCH"})</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Giám Đốc Sáng Tạo &amp; Lên Ý Tưởng Hoạt Động
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-normal">
            Không gian khởi tạo concept độc quyền của bạn: Big Idea, Đối tượng mục tiêu, Shot list cho Ban Kỹ Thuật, Thiết bị và Lịch trình.
          </p>
        </div>
      </div>

      {/* Brainstorm Input Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          BẠN MUỐN LÊN Ý TƯỞNG CHO MỤC TIÊU / CHỦ ĐỀ NÀO?
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleBrainstorm();
              }
            }}
            placeholder="Ví dụ: Chiến dịch tuyển thành viên Gen 2026, Series TikTok dạy chụp ảnh ban đêm, Phototrip Hồ Trị An..."
            className="sm:col-span-8 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-purple-500 shadow-sm"
          />

          <select
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            className="sm:col-span-2 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả định dạng</option>
            <option value="TikTok Short Video">TikTok / Reels</option>
            <option value="Phototrip Ngoại Cảnh">Phototrip Ngoại Cảnh</option>
            <option value="Workshop Kỹ Thuật">Workshop Chuyên Sâu</option>
            <option value="Chiến dịch Tuyển Gen">Tuyển Thành Viên</option>
          </select>

          <button
            onClick={handleBrainstorm}
            disabled={isGenerating}
            className="sm:col-span-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang Nghĩ...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Brainstorm</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Idea Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-500" />
            <span>Kho Concept &amp; Ý Tưởng Sáng Tạo ({ideas.length})</span>
          </h3>

          {ideas.length > 0 && (
            <button
              onClick={handleClearAllIdeas}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Xóa tất cả các concept đã làm xong"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Dọn sạch tất cả</span>
            </button>
          )}
        </div>

        {ideas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea, idx) => (
              <div
                key={idea.id || idx}
                className="p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 flex flex-col justify-between transition-all group shadow-sm hover:shadow-xl hover:shadow-purple-500/10"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                      {idea.format}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Concept #{idx + 1}</span>
                      <button
                        onClick={(e) => handleDeleteIdea(idea.id, e)}
                        title="Xóa ý tưởng này (đã làm xong)"
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                    {idea.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {idea.bigIdea}
                  </p>

                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 dark:text-slate-400">Khán giả mục tiêu: </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{idea.targetAudience}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 text-[11px] space-y-1">
                      <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Shot List cho Ban Kỹ Thuật:</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        {idea.shotlist}
                      </p>
                    </div>

                    {idea.equipment && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-bold">Thiết bị: </span>
                        <span>{idea.equipment}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {idea.timeline}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteIdea(idea.id, e)}
                      title="Xóa ý tưởng này (đã làm xong)"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 dark:hover:text-red-400 text-xs font-medium transition-all cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Xóa</span>
                    </button>

                    <Link
                      href={`/design?title=${encodeURIComponent(idea.title)}&topic=${encodeURIComponent(idea.bigIdea)}&type=workshop&author=${encodeURIComponent(profile?.displayName || "Đỗ Quốc Thảo")}&autoGenerate=true`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                      title="Mở AI Design Studio tạo poster ngay"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Tạo Poster</span>
                    </Link>

                    <button
                      onClick={() => handleAddToCalendar(idea)}
                      disabled={schedulingId === idea.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer active:scale-95"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{schedulingId === idea.id ? "Đang xếp..." : "Đưa Vào Lịch"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Lightbulb className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Chưa có concept nào trong bảng sáng tạo
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Nhập chủ đề bạn muốn phát triển cho câu lạc bộ vào ô ở trên và bấm &quot;Brainstorm&quot; để Gemini AI đề xuất các concept độc đáo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
