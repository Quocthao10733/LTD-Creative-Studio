"use client";

import * as React from "react";
import {
  Video,
  UploadCloud,
  Film,
  Sparkles,
  Play,
  FileText,
  Sliders,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  Scissors,
  Layers,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Camera,
} from "lucide-react";
import { RawClip, EditDecisionList, EDLShot } from "@/lib/types/video";
import { useAuth } from "@/context/auth-context";

export default function VideoEditorPage() {
  const { profile } = useAuth();
  const [activeStep, setActiveStep] = React.useState<number>(1);
  const [selectedRatio, setSelectedRatio] = React.useState<"9:16" | "16:9">("9:16");
  const [directorPrompt, setDirectorPrompt] = React.useState(
    "Dựng video TikTok 9:16 nhịp nhanh, Hook 3s bắt mắt, giới thiệu hoạt động sáng tác của CLB Nhiếp Ảnh LTD"
  );
  const [targetDuration, setTargetDuration] = React.useState(15);

  // Clips state
  const [clips, setClips] = React.useState<RawClip[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [generatingEDL, setGeneratingEDL] = React.useState(false);
  const [rendering, setRendering] = React.useState(false);

  // EDL & Render Output state
  const [edl, setEdl] = React.useState<EditDecisionList | null>(null);
  const [renderedVideo, setRenderedVideo] = React.useState<{
    url: string;
    fileName: string;
    sizeBytes: number;
  } | null>(null);

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Load registered clips on mount
  React.useEffect(() => {
    async function loadClips() {
      try {
        const res = await fetch("/api/video/upload");
        const json = await res.json();
        if (json.success && json.data) {
          setClips(json.data);
        }
      } catch (err) {
        console.error("Lỗi tải clip:", err);
      }
    }
    loadClips();
  }, []);

  // Upload real video file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/video/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        setClips((prev) => [json.data, ...prev]);
        setSuccessToast(`Đã tải lên "${file.name}"!`);
        setTimeout(() => setSuccessToast(null), 3000);
      } else {
        setErrorMessage(json.error || "Lỗi tải video lên máy chủ");
      }
    } catch (err: any) {
      setErrorMessage("Lỗi kết nối upload: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add demo clips for quick testing
  const handleAddSampleClip = () => {
    const sampleClip: RawClip = {
      id: "clip_sample_" + Date.now(),
      name: `LTD_Footage_${clips.length + 1}.mp4`,
      path: "",
      url: "/uploads/sample.mp4",
      duration: 12.5,
      width: selectedRatio === "9:16" ? 1080 : 1920,
      height: selectedRatio === "9:16" ? 1920 : 1080,
      fps: 30,
      sizeBytes: 15420000,
    };
    setClips([sampleClip, ...clips]);
    setSuccessToast("Đã thêm clip mẫu thành công!");
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // Generate EDL via Gemini AI
  const handleGenerateEDL = async () => {
    setGeneratingEDL(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/video/generate-edl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clips,
          prompt: directorPrompt,
          aspectRatio: selectedRatio,
          targetDuration,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setEdl(json.data);
        setActiveStep(4);
        setSuccessToast("Gemini AI đã dựng xong kịch bản EDL!");
        setTimeout(() => setSuccessToast(null), 3000);
      } else {
        setErrorMessage(json.error || "Không thể sinh kịch bản EDL.");
      }
    } catch (err: any) {
      setErrorMessage("Lỗi kết nối AI Director: " + err.message);
    } finally {
      setGeneratingEDL(false);
    }
  };

  // Update shot inline
  const handleUpdateShot = (index: number, updated: Partial<EDLShot>) => {
    if (!edl) return;
    const newShots = [...edl.shots];
    newShots[index] = { ...newShots[index], ...updated };
    setEdl({ ...edl, shots: newShots });
  };

  // Delete shot
  const handleDeleteShot = (index: number) => {
    if (!edl) return;
    const newShots = edl.shots.filter((_, i) => i !== index);
    setEdl({ ...edl, shots: newShots });
  };

  // Render MP4 with FFmpeg
  const handleRenderVideo = async () => {
    if (!edl || edl.shots.length === 0) {
      setErrorMessage("Cần có kịch bản EDL trước khi render!");
      return;
    }

    setRendering(true);
    setErrorMessage(null);
    setActiveStep(5);

    try {
      const res = await fetch("/api/video/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edl }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setRenderedVideo({
          url: json.data.outputUrl,
          fileName: json.data.fileName,
          sizeBytes: json.data.fileSizeBytes,
        });
        setSuccessToast("Đã render thành công file MP4 thật bằng FFmpeg!");
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        setErrorMessage(json.error || "Lỗi khi render video.");
      }
    } catch (err: any) {
      setErrorMessage("Lỗi kết nối Render Engine: " + err.message);
    } finally {
      setRendering(false);
    }
  };

  const steps = [
    { num: 1, title: "1. Upload Clips", desc: "Tải lên các đoạn video gốc" },
    { num: 2, title: "2. Phân Tích Thông Số", desc: "Độ phân giải & thời lượng" },
    { num: 3, title: "3. Gemini Đạo Diễn", desc: "AI lên cấu trúc Hook 3s & nhịp" },
    { num: 4, title: "4. Kịch Bản EDL", desc: "Ban Kỹ Thuật tinh chỉnh timeline" },
    { num: 5, title: "5. Render MP4", desc: "FFmpeg xuất video TikTok 9:16" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-teal-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-2">
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

      {/* Header Banner */}
      <div className="p-7 lg:p-9 rounded-3xl bg-gradient-to-r from-teal-900/30 via-cyan-900/20 to-transparent border border-teal-500/30 text-white shadow-sm">
        <div className="max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold">
            <Film className="w-3.5 h-3.5" />
            <span>AI VIDEO PIPELINE — BIÊN TẬP: {profile?.displayName ? profile.displayName.toUpperCase() : "ĐỖ QUỐC THẢO"} ({profile?.department || "BAN KỸ THUẬT"})</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
            Trợ Lý Đạo Diễn &amp; Hậu Kỳ Video Tự Động
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Quy trình biên tập video tự động bằng AI cho Ban Kỹ Thuật LTD: Upload clip raw, AI sinh Edit Decision List (EDL JSON), tinh chỉnh timeline và render MP4 chuẩn tỷ lệ 9:16 (TikTok/Reels).
          </p>
        </div>
      </div>

      {/* 5-Step Pipeline Steps Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {steps.map((st) => (
          <div
            key={st.num}
            onClick={() => setActiveStep(st.num)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              activeStep === st.num
                ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 shadow-sm"
                : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-bold">{st.title}</div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">{st.desc}</div>
          </div>
        ))}
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================= */}
        {/* LEFT COLUMN: UPLOAD & DIRECTOR SETTINGS (5 cols)          */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-teal-500" />
                <span>Upload Video Gốc (Raw Footage)</span>
              </h3>
              <span className="text-[10px] text-slate-400">MP4, MOV</span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="video/mp4,video/quicktime"
              className="hidden"
            />

            {/* Drag & Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group bg-slate-50/50 dark:bg-slate-800/20"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-500 mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {uploading ? "Đang tải video lên máy chủ..." : "Bấm để chọn file video hoặc kéo thả vào đây"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Tự động trích xuất metadata và thumbnail
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddSampleClip}
                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm clip mẫu để test nhanh</span>
              </button>
            </div>

            {/* Uploaded Clips Inventory */}
            {clips.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Clip nguồn sẵn có ({clips.length})</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {clips.map((clip) => (
                    <div
                      key={clip.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                          <Film className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                            {clip.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {clip.duration.toFixed(1)}s • {clip.width}x{clip.height}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setClips(clips.filter((c) => c.id !== clip.id))}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aspect Ratio & Duration */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                TỶ LỆ KHUNG HÌNH MỤC TIÊU
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRatio("9:16")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    selectedRatio === "9:16"
                      ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  9:16 (TikTok / Reels)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRatio("16:9")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    selectedRatio === "16:9"
                      ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  16:9 (YouTube ngang)
                </button>
              </div>
            </div>

            {/* Director Prompt */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                CHỈ ĐẠO ĐẠO DIỄN (AI PROMPT)
              </label>
              <textarea
                rows={2}
                value={directorPrompt}
                onChange={(e) => setDirectorPrompt(e.target.value)}
                placeholder="Ví dụ: Cắt bỏ đoạn rung, chọn góc máy cận cảnh máy ảnh, nhịp sôi động..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* AI Generate EDL Button */}
            <button
              onClick={handleGenerateEDL}
              disabled={generatingEDL}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generatingEDL ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gemini Đang Dựng Kịch Bản EDL...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sinh Kịch Bản Dựng (AI EDL)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: TIMELINE EDITOR & MP4 PLAYER (7 cols)       */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 min-h-[560px] flex flex-col justify-between shadow-sm">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-teal-500" />
                  <span>Interactive Timeline &amp; Kịch Bản Dựng (EDL)</span>
                </h4>
                {edl && (
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold border border-teal-500/20">
                    {edl.shots.length} Phân Cảnh (Shots)
                  </span>
                )}
              </div>

              {/* RENDERED MP4 RESULT SECTION */}
              {renderedVideo && (
                <div className="p-5 rounded-3xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-400/40 space-y-4 animate-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-teal-500" />
                      <span>Video MP4 Đã Được Render Hoàn Tất Bằng FFmpeg!</span>
                    </div>
                    <a
                      href={renderedVideo.url}
                      download={renderedVideo.fileName}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải MP4 ({(renderedVideo.sizeBytes / 1024 / 1024).toFixed(2)} MB)</span>
                    </a>
                  </div>

                  {/* HTML5 Video Player */}
                  <div className="flex justify-center bg-black/80 rounded-2xl overflow-hidden p-2">
                    <video
                      controls
                      src={renderedVideo.url}
                      className="max-h-72 rounded-xl shadow-lg"
                      playsInline
                    />
                  </div>
                </div>
              )}

              {/* EDL TIMELINE SHOT LIST */}
              {edl ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{edl.title}</span>
                      <span className="text-slate-400 block text-[11px]">
                        Tỷ lệ: {edl.aspectRatio} • Nhạc nền: {edl.backgroundMusic}
                      </span>
                    </div>
                    <span className="text-teal-600 font-bold">Ban Kỹ Thuật Review</span>
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {edl.shots.map((shot, idx) => (
                      <div
                        key={shot.id || idx}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 font-bold text-[10px]">
                              Shot #{idx + 1}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                              {shot.clipName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-medium">
                              {shot.startSec}s ➔ {shot.endSec}s
                            </span>
                            <button
                              onClick={() => handleDeleteShot(idx)}
                              className="text-slate-400 hover:text-red-500 p-1"
                              title="Bỏ shot này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Editable Subtitle / Text Overlay */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">Phụ đề:</span>
                          <input
                            type="text"
                            value={shot.subtitleText || ""}
                            onChange={(e) => handleUpdateShot(idx, { subtitleText: e.target.value })}
                            placeholder="Nhập nội dung phụ đề hiển thị trên video..."
                            className="flex-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="h-72 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-14 h-14 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 mb-3">
                    <Film className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                    Chưa có dự án video nào đang chạy
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    Tải clip lên và bấm &quot;Sinh Kịch Bản Dựng (AI EDL)&quot; để trợ lý đạo diễn phân tích và sắp xếp các shot quay theo cấu trúc chuẩn.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions: Render trigger */}
            {edl && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-medium">
                  Động cơ: FFmpeg H.264 (AAC Audio)
                </div>

                <button
                  onClick={handleRenderVideo}
                  disabled={rendering}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md shadow-teal-500/25 disabled:opacity-50"
                >
                  {rendering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>FFmpeg Đang Render Video...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Render Video MP4 Thật</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
