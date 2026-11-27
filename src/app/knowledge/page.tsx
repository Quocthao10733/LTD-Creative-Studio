"use client";

import * as React from "react";
import {
  BookOpen,
  Upload,
  CheckCircle2,
  AlertCircle,
  Search,
  Tag,
  Edit3,
  Trash2,
  Plus,
  X,
  Check,
  Database,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  GoldenDatasetMeta,
  GoldenSample,
  QualityTier,
  SampleApprovalStatus,
} from "@/lib/types/knowledge";

export default function KnowledgeSamplesPage() {
  const [samples, setSamples] = React.useState<GoldenSample[]>([]);
  const [meta, setMeta] = React.useState<GoldenDatasetMeta | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [toast, setToast] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Import Modal State
  const [importOpen, setImportOpen] = React.useState(false);
  const [importFormat, setImportFormat] = React.useState<"markdown" | "json" | "csv" | "text">("markdown");
  const [importContent, setImportContent] = React.useState("");
  const [importBatchId, setImportBatchId] = React.useState("BATCH_02");
  const [importing, setImporting] = React.useState(false);
  const [importReport, setImportReport] = React.useState<{
    imported_count: number;
    imported_ids: string[];
    errors: string[];
  } | null>(null);

  // Edit / Review Modal State
  const [editingSample, setEditingSample] = React.useState<GoldenSample | null>(null);
  const [editTier, setEditTier] = React.useState<QualityTier>(null);
  const [editStatus, setEditStatus] = React.useState<SampleApprovalStatus>("UNREVIEWED_CANDIDATE");
  const [editLabels, setEditLabels] = React.useState("");
  const [editNotes, setEditNotes] = React.useState("");
  const [editRetrieval, setEditRetrieval] = React.useState(true);
  const [savingEdit, setSavingEdit] = React.useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSamples = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/knowledge/samples");
      const json = await res.json();
      if (json.success) {
        setSamples(json.data || []);
        setMeta(json.dataset_meta || null);
      }
    } catch {
      setErrorMsg("Không thể tải danh sách Golden Samples.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  const categories = React.useMemo(() => {
    const set = new Set(samples.map((s) => s.category));
    return Array.from(set);
  }, [samples]);

  const filteredSamples = React.useMemo(() => {
    return samples.filter((s) => {
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
      if (tierFilter !== "all") {
        if (tierFilter === "unreviewed" && s.quality_tier !== null) return false;
        if (tierFilter !== "unreviewed" && s.quality_tier !== tierFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hit =
          s.sample_id.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.original_text.toLowerCase().includes(q) ||
          s.style_labels.some((l) => l.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [samples, categoryFilter, tierFilter, searchQuery]);

  const openEditModal = (sample: GoldenSample) => {
    setEditingSample(sample);
    setEditTier(sample.quality_tier);
    setEditStatus(sample.approval_status);
    setEditLabels(sample.style_labels.join(", "));
    setEditNotes(sample.review_notes || "");
    setEditRetrieval(sample.approved_for_retrieval);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSample) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/knowledge/samples", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sample_id: editingSample.sample_id,
          quality_tier: editTier,
          approval_status: editStatus,
          style_labels: editLabels
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          review_notes: editNotes,
          approved_for_retrieval: editRetrieval,
          reviewed_by_role: "admin_or_comm_lead",
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchSamples();
        setEditingSample(null);
        showToast(`Đã cập nhật đánh giá cho ${editingSample.sample_id}`);
      } else {
        setErrorMsg(json.error || "Lỗi cập nhật bài mẫu.");
      }
    } catch {
      setErrorMsg("Lỗi kết nối khi lưu đánh giá.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setImportReport(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/knowledge/samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: importFormat,
          rawContent: importContent,
          batchId: importBatchId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setImportReport({
          imported_count: json.imported_count,
          imported_ids: json.imported_ids || [],
          errors: json.errors || [],
        });
        await fetchSamples();
        showToast(`Đã import thành công ${json.imported_count} bài mẫu mới!`);
        setImportContent("");
      } else {
        setErrorMsg(json.error || "Import thất bại.");
      }
    } catch {
      setErrorMsg("Lỗi kết nối khi import batch.");
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteSample = async (id: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài mẫu ${id} khỏi kho?`)) return;
    try {
      const res = await fetch(`/api/knowledge/samples?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        await fetchSamples();
        showToast(`Đã xóa bài mẫu ${id}`);
      }
    } catch {
      setErrorMsg("Lỗi khi xóa bài mẫu.");
    }
  };

  const sampleCount = meta?.sample_count ?? samples.length;
  const targetMin = meta?.target_min ?? 20;
  const progressPct = Math.min(100, Math.round((sampleCount / targetMin) * 100));

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3 text-xs text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)}>✕</button>
        </div>
      )}

      {/* Header & Dataset Status Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-cyan-400 text-xs font-bold mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>KHO GOLDEN SAMPLES — LTD BRAND WRITER</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Quản Lý Bài Mẫu Fanpage &amp; Chấm Tier Chất Lượng
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Dữ liệu gốc từ Fanpage LTD để AI tham khảo cấu trúc và phong cách (không sao chép nguyên văn).
            </p>
          </div>

          <button
            onClick={() => {
              setImportReport(null);
              setImportOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Import Batch Mới</span>
          </button>
        </div>

        {/* Dataset Progress & Honest Status */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {meta?.dataset_status || "INITIAL_BATCH"}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Hiện có {sampleCount} / {targetMin}–{meta?.target_max || 30} bài mục tiêu
              </span>
            </div>
            <div className="w-full max-w-md h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Lưu ý: Chỉ số lượng bài thật được nhập; hệ thống không tự tạo bài giả và vẫn cho phép Brand Writer hoạt động bình thường.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo ID (LTD-POST-001), tiêu đề, nội dung hoặc nhãn..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
        >
          <option value="all">Tất cả nhóm nội dung</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
        >
          <option value="all">Tất cả Tier</option>
          <option value="unreviewed">Chưa chấm Tier (UNREVIEWED)</option>
          <option value="A">Tier A — Signature</option>
          <option value="B">Tier B — Useful</option>
          <option value="C">Tier C — Lessons (Không retrieval)</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Samples List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Đang tải kho bài mẫu...</div>
      ) : filteredSamples.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          Không tìm thấy bài mẫu nào phù hợp bộ lọc.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSamples.map((sample) => (
            <div
              key={sample.sample_id}
              className="p-5 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-bold">
                      {sample.sample_id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-cyan-400">
                      {sample.category}
                    </span>
                    {sample.quality_tier ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sample.quality_tier === "A"
                            ? "bg-emerald-100 text-emerald-800"
                            : sample.quality_tier === "B"
                              ? "bg-cyan-100 text-cyan-800"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        Tier {sample.quality_tier}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {sample.approval_status}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(sample)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Chấm Tier & sửa metadata"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSample(sample.sample_id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Xóa bài mẫu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {sample.title}
                </h3>

                <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto leading-relaxed">
                  {sample.original_text}
                </pre>

                {sample.observed_style_notes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Dấu hiệu phong cách:</strong> {sample.observed_style_notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex flex-wrap gap-1">
                  {sample.style_labels.map((lbl) => (
                    <span
                      key={lbl}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      #{lbl}
                    </span>
                  ))}
                </div>

                <span
                  className={`font-semibold ${
                    sample.approved_for_retrieval ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {sample.approved_for_retrieval ? "● Đang bật Retrieval" : "○ Đã tắt Retrieval"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IMPORT MODAL */}
      {importOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c131d] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Import Batch Bài Mẫu Mới (Markdown / JSON / CSV / Text)
                </h3>
              </div>
              <button onClick={() => setImportOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {importReport && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <p className="font-bold text-emerald-700 dark:text-emerald-300">
                  ✅ Đã import {importReport.imported_count} bài mẫu mới: {importReport.imported_ids.join(", ")}
                </p>
                {importReport.errors.length > 0 && (
                  <p className="text-amber-700">Cảnh báo: {importReport.errors.join(" | ")}</p>
                )}
              </div>
            )}

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Định dạng dữ liệu
                  </label>
                  <select
                    value={importFormat}
                    onChange={(e) => setImportFormat(e.target.value as typeof importFormat)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                  >
                    <option value="markdown">Markdown (chuẩn Batch # POST ...)</option>
                    <option value="json">JSON Array / GoldenDataset</option>
                    <option value="csv">CSV (title,category,original_text)</option>
                    <option value="text">Dán trực tiếp 1 bài viết (Plain Text)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Batch
                  </label>
                  <input
                    type="text"
                    value={importBatchId}
                    onChange={(e) => setImportBatchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nội dung Batch (tự động gắn UNREVIEWED_CANDIDATE)
                </label>
                <textarea
                  rows={10}
                  required
                  value={importContent}
                  onChange={(e) => setImportContent(e.target.value)}
                  placeholder="Dán nội dung Markdown, JSON, CSV hoặc caption gốc từ Fanpage LTD vào đây..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setImportOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {importing ? "Đang import..." : "Xác Nhận Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW / EDIT MODAL */}
      {editingSample && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c131d] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Đánh Giá &amp; Chấm Tier: {editingSample.sample_id}
              </h3>
              <button onClick={() => setEditingSample(null)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Quality Tier
                  </label>
                  <select
                    value={editTier === null ? "null" : editTier}
                    onChange={(e) =>
                      setEditTier(e.target.value === "null" ? null : (e.target.value as QualityTier))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="null">Chưa chấm (null)</option>
                    <option value="A">Tier A — Signature</option>
                    <option value="B">Tier B — Useful</option>
                    <option value="C">Tier C — Lessons (không làm mẫu)</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Trạng thái duyệt
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as SampleApprovalStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="UNREVIEWED_CANDIDATE">UNREVIEWED_CANDIDATE</option>
                    <option value="APPROVED_SAMPLE">APPROVED_SAMPLE</option>
                    <option value="NEEDS_EDIT">NEEDS_EDIT</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Nhãn phong cách (cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={editLabels}
                  onChange={(e) => setEditLabels(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Ghi chú của người duyệt
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editRetrieval}
                  onChange={(e) => setEditRetrieval(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span>Cho phép AI truy xuất bài này (Retrieval)</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSample(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {savingEdit ? "Đang lưu..." : "Lưu Đánh Giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
