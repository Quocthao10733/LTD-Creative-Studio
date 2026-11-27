"use client";

import * as React from "react";
import Link from "next/link";
import {
  Lightbulb,
  Sparkles,
  Compass,
  Calendar,
  Camera,
  Layers,
  Wand2,
  Check,
  AlertTriangle,
  Clock,
  Trash2,
  Palette,
  ClipboardList,
  PackageCheck,
  ShieldCheck,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { DirectorPlanCanvas, IdeaCard } from "@/lib/types/director";
import { useAuth } from "@/context/auth-context";
import { getStoredGeminiModel } from "@/lib/ai/models";
import { ResourceItem } from "@/lib/ai/knowledge/director/org-knowledge";

export default function DirectorPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"brainstorm" | "canvas" | "resources">("brainstorm");

  // Tab 1: Brainstorm Concepts
  const [topic, setTopic] = React.useState("");
  const [focusArea, setFocusArea] = React.useState("all");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [ideas, setIdeas] = React.useState<IdeaCard[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);
  const [schedulingId, setSchedulingId] = React.useState<string | null>(null);

  // Tab 2: Event Canvas & Monthly Plans
  const [plans, setPlans] = React.useState<DirectorPlanCanvas[]>([]);
  const [planName, setPlanName] = React.useState("");
  const [planType, setPlanType] = React.useState<"event_canvas" | "monthly_plan">("event_canvas");
  const [planObjective, setPlanObjective] = React.useState("");
  const [planConstraints, setPlanConstraints] = React.useState("");
  const [generatingPlan, setGeneratingPlan] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<DirectorPlanCanvas | null>(null);

  // Tab 3: Resource Inventory
  const [resources, setResources] = React.useState<ResourceItem[]>([]);
  const [resName, setResName] = React.useState("");
  const [resCategory, setResCategory] = React.useState<ResourceItem["category"]>("camera");
  const [resStatus, setResStatus] = React.useState<ResourceItem["status"]>("Available");
  const [resNotes, setResNotes] = React.useState("");

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  React.useEffect(() => {
    async function loadInitial() {
      try {
        const [ideasRes, plansRes, resRes] = await Promise.all([
          fetch("/api/ideas").then((r) => r.json()).catch(() => ({ success: false })),
          fetch("/api/director/plans").then((r) => r.json()).catch(() => ({ success: false })),
          fetch("/api/director/resources").then((r) => r.json()).catch(() => ({ success: false })),
        ]);
        if (ideasRes.success && Array.isArray(ideasRes.data)) setIdeas(ideasRes.data);
        if (plansRes.success && Array.isArray(plansRes.data)) {
          setPlans(plansRes.data);
          if (plansRes.data.length > 0) setSelectedPlan(plansRes.data[0]);
        }
        if (resRes.success && Array.isArray(resRes.data)) setResources(resRes.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu Director:", err);
      }
    }
    loadInitial();
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
        for (const idea of json.data) {
          await fetch("/api/ideas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(idea),
          });
        }
        showToast(`Đã sinh và lưu ${json.data.length} concept (trạng thái PROPOSED)!`);
      } else {
        setErrorMessage(json.error || "Không thể sinh ý tưởng. Vui lòng thử lại!");
      }
    } catch (err: unknown) {
      setErrorMessage("Lỗi kết nối khi gọi AI Creative Director: " + (err instanceof Error ? err.message : ""));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCanvas = async (presetName?: string, presetObjective?: string) => {
    const targetName = (presetName || planName).trim();
    if (!targetName) {
      setErrorMessage("Vui lòng nhập tên sự kiện hoặc chủ đề kế hoạch tháng!");
      return;
    }
    setErrorMessage(null);
    setGeneratingPlan(true);
    setActiveTab("canvas");

    try {
      const res = await fetch("/api/ai/director/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType,
          name: targetName,
          objective: (presetObjective || planObjective).trim(),
          constraints: planConstraints.trim(),
          model: getStoredGeminiModel(),
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const saveRes = await fetch("/api/director/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json.data),
        });
        const saveJson = await saveRes.json();
        const savedPlan: DirectorPlanCanvas = saveJson.success ? saveJson.data : json.data;
        setPlans((prev) => [savedPlan, ...prev]);
        setSelectedPlan(savedPlan);
        showToast("Đã tạo Event Planning Canvas (trạng thái PROPOSED — chờ Ban Điều hành duyệt)!");
      } else {
        setErrorMessage(json.error || "Không thể tạo Event Canvas.");
      }
    } catch {
      setErrorMessage("Lỗi kết nối khi lập Event Canvas.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleUpdatePlanStatus = async (planId: string, nextStatus: "NEEDS_REVIEW" | "APPROVED" | "CANCELLED") => {
    try {
      const res = await fetch("/api/director/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          approvalStatus: nextStatus,
          approverRole: profile?.role || "Thành viên",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPlans((prev) => prev.map((p) => (p.planId === planId ? json.data : p)));
        setSelectedPlan(json.data);
        showToast(`Đã chuyển trạng thái kế hoạch sang ${nextStatus}!`);
      } else {
        setErrorMessage(json.error || "Không đủ quyền phê duyệt.");
      }
    } catch {
      setErrorMessage("Lỗi cập nhật trạng thái kế hoạch.");
    }
  };

  const handleExportApprovedPlanToCalendar = async (plan: DirectorPlanCanvas) => {
    if (plan.approvalStatus !== "APPROVED") {
      setErrorMessage("Chỉ kế hoạch đã APPROVED mới được xuất sang Lịch CLB!");
      return;
    }
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: plan.name,
          date: new Date().toISOString().slice(0, 10),
          time: "09:00",
          type: "workshop",
          department: "ALL",
          description: `${plan.objective}\n${plan.concept}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetch("/api/director/plans", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: plan.planId, exportedToCalendar: true }),
        });
        showToast(`Đã xuất "${plan.name}" sang Lịch CLB!`);
      }
    } catch {
      setErrorMessage("Lỗi khi xuất sang lịch.");
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName.trim()) return;
    try {
      const res = await fetch("/api/director/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resName.trim(),
          category: resCategory,
          status: resStatus,
          notes: resNotes.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResources((prev) => [json.data, ...prev]);
        setResName("");
        setResNotes("");
        showToast("Đã lưu nguồn lực vào Resource Inventory!");
      }
    } catch {
      setErrorMessage("Lỗi thêm nguồn lực.");
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await fetch(`/api/director/resources?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  };

  const handleAddToCalendar = async (idea: IdeaCard) => {
    setSchedulingId(idea.id);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `[PROPOSED] ${idea.title}`,
          date: new Date().toISOString().slice(0, 10),
          time: "14:00",
          type: idea.format.toLowerCase().includes("tiktok") ? "tiktok_video" : "workshop",
          department: "ALL",
          description: `${idea.bigIdea}\nShot list: ${idea.shotlist}\nThiết bị: ${idea.equipment}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Đã đưa đề xuất "${idea.title}" vào Lịch chờ duyệt!`);
      }
    } catch {
      setErrorMessage("Lỗi khi đưa ý tưởng vào lịch");
    } finally {
      setSchedulingId(null);
    }
  };

  const handleDeleteIdea = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIdeas((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/ideas?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      showToast("Đã xóa ý tưởng khỏi kho sáng tạo!");
    } catch {}
  };

  const handleClearAllIdeas = async () => {
    if (ideas.length === 0) return;
    if (!window.confirm("Bạn có chắc chắn muốn dọn sạch tất cả ý tưởng trong danh sách này không?")) return;
    setIdeas([]);
    try {
      await fetch("/api/ideas?id=all", { method: "DELETE" });
      showToast("Đã dọn sạch kho ý tưởng!");
    } catch {}
  };

  return (
    <div className="space-y-6">
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-purple-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold">
          <Check className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start justify-between gap-3 text-xs text-red-600 dark:text-red-400">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)}>✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden p-7 lg:p-8 rounded-3xl bg-gradient-to-r from-[#170e30] via-[#24174a] to-[#311c66] border border-purple-500/40 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>
              LTD CREATIVE DIRECTOR — {profile?.displayName ? profile.displayName.toUpperCase() : "BAN ĐIỀU HÀNH"} ({profile?.role || "CHỦ TỊCH"})
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Giám Đốc Sáng Tạo &amp; Hoạch Định Vận Hành CLB
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
            Đọc dữ liệu thành viên &amp; nguồn lực thật. Mọi kế hoạch mặc định ở trạng thái <strong>PROPOSED</strong> cho tới khi Ban Điều hành phê duyệt.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => setActiveTab("brainstorm")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "brainstorm"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>1. Brainstorm Concept ({ideas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("canvas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "canvas"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>2. Event Canvas, RACI &amp; Phê Duyệt ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "resources"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>3. Nguồn Lực CLB ({resources.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: BRAINSTORM ================= */}
      {activeTab === "brainstorm" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              CHỦ ĐỀ / MỤC TIÊU HOẠT ĐỘNG CẦN BRAINSTORM
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
                placeholder="Ví dụ: Workshop bố cục cho thành viên mới, Photowalk Long Thành, Kế hoạch tháng 12..."
                className="sm:col-span-8 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />

              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="sm:col-span-2 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="all">Tất cả định dạng</option>
                <option value="Workshop Kỹ Thuật">Workshop Kỹ Thuật</option>
                <option value="Photowalk Thực Hành">Photowalk Thực Hành</option>
                <option value="TikTok Short Video">TikTok / Reels</option>
                <option value="Showcase / Triển Lãm">Showcase / Tổng kết</option>
              </select>

              <button
                onClick={handleBrainstorm}
                disabled={isGenerating}
                className="sm:col-span-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang nghĩ...</span>
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

          {ideas.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Các Concept Đề Xuất ({ideas.length})</span>
                </h3>
                <button
                  onClick={handleClearAllIdeas}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Dọn sạch</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {idea.approvalStatus || "PROPOSED"}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[10px] font-bold">
                          {idea.format}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                        {idea.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {idea.bigIdea}
                      </p>

                      {idea.missingConfirmations && idea.missingConfirmations.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                          <strong>Cần xác nhận:</strong> {idea.missingConfirmations.join(" · ")}
                        </div>
                      )}

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                          <Layers className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                          <span><strong>Triển khai:</strong> {idea.shotlist}</span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                          <Camera className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                          <span><strong>Thiết bị:</strong> {idea.equipment}</span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span><strong>Timeline:</strong> {idea.timeline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => handleGenerateCanvas(idea.title, idea.bigIdea)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Lập Event Canvas</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/design?title=${encodeURIComponent(idea.title)}&topic=${encodeURIComponent(idea.bigIdea)}&author=${encodeURIComponent(profile?.displayName || "Thành viên LTD")}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                        >
                          <Palette className="w-3.5 h-3.5" />
                          <span>Poster</span>
                        </Link>
                        <button
                          onClick={() => handleAddToCalendar(idea)}
                          disabled={schedulingId === idea.id}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-purple-600 cursor-pointer"
                          title="Đưa vào lịch chờ duyệt"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteIdea(idea.id, e)}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: EVENT CANVAS, RACI & APPROVAL ================= */}
      {activeTab === "canvas" && (
        <div className="space-y-6">
          {/* Form Create Plan */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Tạo Kế Hoạch Tháng / Event Planning Canvas Mới (Mặc định: PROPOSED)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as typeof planType)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              >
                <option value="event_canvas">Event Planning Canvas (1 Sự kiện)</option>
                <option value="monthly_plan">Monthly Operating Plan (Kế hoạch Tháng)</option>
              </select>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Tên sự kiện hoặc Kế hoạch tháng (VD: Workshop Ánh Sáng)"
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={planObjective}
                onChange={(e) => setPlanObjective(e.target.value)}
                placeholder="Mục tiêu chính (VD: Giúp 15 thành viên mới nắm chắc khẩu độ/ISO)"
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
              <input
                type="text"
                value={planConstraints}
                onChange={(e) => setPlanConstraints(e.target.value)}
                placeholder="Ràng buộc ngân sách / lịch / thiết bị hiện có..."
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
            <button
              onClick={() => handleGenerateCanvas()}
              disabled={generatingPlan}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {generatingPlan ? "AI đang lập Event Canvas + RACI + KPI..." : "Sinh Event Canvas & WBS/RACI"}
            </button>
          </div>

          {/* Plans Selector & Active Plan Detail */}
          {plans.length > 0 && selectedPlan && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left list */}
              <div className="lg:col-span-4 space-y-2.5">
                {plans.map((p) => (
                  <button
                    key={p.planId}
                    onClick={() => setSelectedPlan(p)}
                    className={`w-full text-left p-4 rounded-2xl border transition cursor-pointer ${
                      selectedPlan.planId === p.planId
                        ? "bg-purple-50 dark:bg-purple-950/30 border-purple-500"
                        : "bg-white dark:bg-[#0c131d] border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {p.approvalStatus}
                      </span>
                      <span className="text-[10px] text-slate-400">{p.planType}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</p>
                  </button>
                ))}
              </div>

              {/* Right Canvas Detail */}
              <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      Trạng thái: {selectedPlan.approvalStatus}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
                      {selectedPlan.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedPlan.approvalStatus !== "APPROVED" && (
                      <button
                        onClick={() => handleUpdatePlanStatus(selectedPlan.planId, "APPROVED")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Phê Duyệt (Ban Điều Hành)</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleExportApprovedPlanToCalendar(selectedPlan)}
                      disabled={selectedPlan.approvalStatus !== "APPROVED"}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                      title="Chỉ xuất sang Lịch sau khi đã được APPROVED"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Xuất Sang Lịch CLB</span>
                    </button>
                  </div>
                </div>

                {/* Missing Confirmations */}
                {selectedPlan.missingConfirmations?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    <p className="font-bold">⚠️ Các điểm Ban Điều hành cần xác nhận (Needs confirmation):</p>
                    <ul className="list-disc pl-4">
                      {selectedPlan.missingConfirmations.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <strong>Mục tiêu:</strong> {selectedPlan.objective}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <strong>Đối tượng:</strong> {selectedPlan.audience}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <strong>Địa điểm / Thời gian:</strong> {selectedPlan.venueStatus} · {selectedPlan.dateTimeStatus}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <strong>Ngân sách / Host:</strong> {selectedPlan.budgetStatus} · {selectedPlan.hostStatus}
                  </div>
                </div>

                {/* Run Sheet */}
                {selectedPlan.runSheet?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase text-slate-500">Run Sheet Dự Kiến</h4>
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                          <tr>
                            <th className="p-2.5">Thời gian</th>
                            <th className="p-2.5">Hoạt động</th>
                            <th className="p-2.5">Ban phụ trách</th>
                            <th className="p-2.5">Thiết bị</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPlan.runSheet.map((row, idx) => (
                            <tr key={idx} className="border-t border-slate-100 dark:border-slate-800">
                              <td className="p-2.5 font-mono">{row.time}</td>
                              <td className="p-2.5">{row.activity}</td>
                              <td className="p-2.5 font-bold">{row.ownerDepartment}</td>
                              <td className="p-2.5">{row.equipment}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* WBS / RACI Tasks */}
                {selectedPlan.raciTasks?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase text-slate-500">WBS &amp; Phân Công Ban (RACI)</h4>
                    <div className="space-y-2">
                      {selectedPlan.raciTasks.map((t) => (
                        <div key={t.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex flex-wrap justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{t.taskName}</p>
                            <p className="text-slate-500">Đầu ra: {t.deliverable} · Tiêu chí: {t.completionCriteria}</p>
                          </div>
                          <div className="text-right font-mono text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                              R: {t.responsibleDept} | A: {t.accountableRole}
                            </span>
                            <p className="text-slate-400 mt-1">{t.deadlineLabel}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campaign Pre/During/Post & KPI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-1.5">
                    <h5 className="font-bold text-slate-800 dark:text-white">Truyền thông Pre / During / Post</h5>
                    <p><strong>Pre:</strong> {selectedPlan.campaign?.preEvent?.join("; ")}</p>
                    <p><strong>During:</strong> {selectedPlan.campaign?.duringEvent?.join("; ")}</p>
                    <p><strong>Post:</strong> {selectedPlan.campaign?.postEvent?.join("; ")}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-1.5">
                    <h5 className="font-bold text-slate-800 dark:text-white">KPI (Target / Estimate / Actual)</h5>
                    {selectedPlan.kpis?.map((k, idx) => (
                      <div key={idx} className="border-b border-slate-200/60 pb-1">
                        <p className="font-semibold">{k.metric} ({k.category})</p>
                        <p className="text-[11px] text-slate-500">
                          Target: {k.target} | Estimate: {k.estimate} | Actual: {k.actual ?? "Chưa đo"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: RESOURCE INVENTORY ================= */}
      {activeTab === "resources" && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddResource}
            className="p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
          >
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Khai Báo Nguồn Lực Thực Tế Của CLB (Thiết bị / Địa điểm / Ngân sách / Người hướng dẫn)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                required
                value={resName}
                onChange={(e) => setResName(e.target.value)}
                placeholder="Tên thiết bị / địa điểm / ngân sách..."
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
              <select
                value={resCategory}
                onChange={(e) => setResCategory(e.target.value as ResourceItem["category"])}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                <option value="camera">Máy ảnh</option>
                <option value="lens">Ống kính</option>
                <option value="lighting">Đèn / Chân máy</option>
                <option value="venue">Địa điểm sinh hoạt</option>
                <option value="software">Phần mềm / Máy tính</option>
                <option value="budget">Ngân sách</option>
                <option value="instructor">Người hướng dẫn</option>
              </select>
              <select
                value={resStatus}
                onChange={(e) => setResStatus(e.target.value as ResourceItem["status"])}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                <option value="Available">Available (Sẵn sàng)</option>
                <option value="Limited">Limited (Hạn chế)</option>
                <option value="Unavailable">Unavailable (Không có)</option>
                <option value="Needs confirmation">Needs confirmation</option>
              </select>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={resNotes}
                onChange={(e) => setResNotes(e.target.value)}
                placeholder="Ghi chú thêm (số lượng, điều kiện mượn...)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Nguồn Lực</span>
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      {r.status}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{r.category}</span>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                  {r.notes && <p className="text-slate-500">{r.notes}</p>}
                </div>
                <button
                  onClick={() => handleDeleteResource(r.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
