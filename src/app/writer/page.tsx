"use client";

import * as React from "react";
import {
  PenSquare,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Bookmark,
  Share2,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Eye,
  Clock,
  History,
  Download,
  Trash2,
  Camera,
  MessageSquare,
  Send,
  Bot,
  User,
  Undo2,
  CornerDownLeft,
} from "lucide-react";
import { GenerateContentResponse } from "@/lib/types/content";
import { useAuth } from "@/context/auth-context";

const PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: "f", desc: "Fanpage & Nhóm cộng đồng" },
  { id: "tiktok", name: "TikTok", icon: "♫", desc: "Kịch bản video ngắn dạng dọc" },
  { id: "instagram", name: "Instagram", icon: "📷", desc: "Caption ảnh & Reels" },
  { id: "threads", name: "Threads", icon: "🧵", desc: "Hội thoại ngắn & quan điểm ảnh" },
  { id: "website", name: "Website / Blog", icon: "🌐", desc: "Bài viết chuyên sâu LTD" },
];

const POST_TYPES = [
  { id: "workshop_recap", name: "Recap Workshop / Phototrip" },
  { id: "photo_caption", name: "Caption Bộ Ảnh Nghệ Thuật" },
  { id: "member_recruitment", name: "Thông Báo Tuyển Thành Viên" },
  { id: "gear_review", name: "Đánh Giá Thiết Bị / Tips Ảnh" },
  { id: "storytelling", name: "Câu Chuyện Nhiếp Ảnh & Cảm Hứng" },
];

const TONES = [
  { id: "artistic", name: "Nghệ thuật & Tinh tế" },
  { id: "youthful", name: "Trẻ trung & Năng động (Gen Z)" },
  { id: "technical", name: "Chuyên môn & Chuẩn xác" },
  { id: "inspirational", name: "Truyền cảm hứng & Sâu lắng" },
  { id: "formal", name: "Trang trọng & Thông báo chính thức" },
];

interface HistoryItem {
  id: string;
  topic: string;
  platform: string;
  postType: string;
  content: GenerateContentResponse;
  timestamp: string;
}

export default function ContentWriterPage() {
  const { profile } = useAuth();
  const [platform, setPlatform] = React.useState("facebook");
  const [postType, setPostType] = React.useState("workshop_recap");
  const [tone, setTone] = React.useState("artistic");
  const [topic, setTopic] = React.useState("");
  const [targetAudience, setTargetAudience] = React.useState("Học sinh, sinh viên yêu thích nhiếp ảnh");
  const [facts, setFacts] = React.useState("");
  const [lengthPref, setLengthPref] = React.useState<"short" | "medium" | "long">("medium");
  const [includeAuthorSignature, setIncludeAuthorSignature] = React.useState(true);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  // Editable output state
  const [output, setOutput] = React.useState<GenerateContentResponse | null>(null);
  const [editableBody, setEditableBody] = React.useState("");
  const [editableHook, setEditableHook] = React.useState("");

  // Chat with AI state
  const [activeWorkspaceTab, setActiveWorkspaceTab] = React.useState<"editor" | "chat">("editor");
  interface ChatMessageItem {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: string;
    revisedHook?: string;
    revisedBody?: string;
    previousHook?: string;
    previousBody?: string;
  }
  const [chatMessages, setChatMessages] = React.useState<ChatMessageItem[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Chào bạn! Tôi là Trợ Lý Biên Tập AI LTD. Sau khi tạo bài viết, nếu bạn thấy đoạn nào chưa hay, dài quá, ngắn quá hoặc muốn đổi phong cách, bạn chỉ cần chat trực tiếp ở đây để tôi chỉnh sửa nhé!",
      timestamp: "Trợ lý AI",
    },
  ]);
  const [chatInput, setChatInput] = React.useState("");
  const [isChatSubmitting, setIsChatSubmitting] = React.useState(false);
  const [versionHistory, setVersionHistory] = React.useState<{ hook: string; body: string }[]>([]);
  const chatScrollRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatSubmitting]);

  // History state
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);

  // Load history from localStorage
  React.useEffect(() => {
    const savedHist = localStorage.getItem("LTD_WRITER_HISTORY");
    if (savedHist) {
      try {
        setHistory(JSON.parse(savedHist));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveToHistory = (res: GenerateContentResponse) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      topic: topic.trim(),
      platform,
      postType,
      content: res,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
    };
    const updated = [newItem, ...history.slice(0, 19)];
    setHistory(updated);
    localStorage.setItem("LTD_WRITER_HISTORY", JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMessage("Vui lòng nhập chủ đề bài viết trước khi tạo!");
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          postType,
          tone,
          topic: topic.trim(),
          facts: `${facts.trim()} | Đối tượng: ${targetAudience} | Độ dài: ${lengthPref}`,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        let finalBody = json.data.body;
        if (includeAuthorSignature) {
          const authorName = profile?.displayName || "Đỗ Quốc Thảo";
          const authorDept = profile?.department || "Ban Kỹ thuật";
          const authorRole = profile?.role || "Chủ tịch CLB";
          const authorPhone = profile?.phone ? ` | Hotline/Zalo: ${profile.phone}` : "";
          const signature = `\n\n---\n✍️ Tác giả: ${authorName} — ${authorRole} (${authorDept})\n📸 CLB Nhiếp Ảnh Long Thành Digital (LTD Photo Club)${authorPhone}`;
          if (!finalBody.includes(authorName)) {
            finalBody = `${finalBody.trim()}${signature}`;
          }
        }
        const personalizedData = { ...json.data, body: finalBody };
        setOutput(personalizedData);
        setEditableHook(json.data.hook);
        setEditableBody(finalBody);
        saveToHistory(personalizedData);
      } else {
        setErrorMessage(json.error || "Không thể tạo nội dung. Vui lòng thử lại!");
      }
    } catch (err: any) {
      setErrorMessage("Lỗi kết nối: " + (err.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    const textToCopy = `${editableHook}\n\n${editableBody}\n\n${output.hashtags.join(" ")}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = async () => {
    if (!output) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editableHook.slice(0, 60),
          platform,
          postType,
          tone,
          hook: editableHook,
          body: editableBody,
          hashtags: output.hashtags,
          visualTips: output.visualTips,
          factsChecklist: output.factsChecklist,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessToast("Đã lưu bài viết vào Thư viện LTD thành công!");
        setTimeout(() => setSuccessToast(null), 3500);
      }
    } catch (err: any) {
      setErrorMessage("Lỗi khi lưu bài viết: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormat = (command: "bold" | "italic" | "bullet" | "quote") => {
    // Basic text transformation on active selection or append
    if (command === "bold") {
      setEditableBody((prev) => prev + " **in đậm** ");
    } else if (command === "italic") {
      setEditableBody((prev) => prev + " *in nghiêng* ");
    } else if (command === "bullet") {
      setEditableBody((prev) => prev + "\n• Điểm lưu ý: ");
    } else if (command === "quote") {
      setEditableBody((prev) => prev + '\n❝ "Trích dẫn nghệ thuật" ❞\n');
    }
  };

  // Chat with AI refinement handler
  const handleSendChatMessage = async (customMessage?: string) => {
    const msgToSend = (customMessage || chatInput).trim();
    if (!msgToSend) return;

    const timeNow = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMsg = {
      id: Date.now().toString(),
      sender: "user" as const,
      text: msgToSend,
      timestamp: timeNow,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatSubmitting(true);

    const prevHook = editableHook;
    const prevBody = editableBody;
    setVersionHistory((prev) => [{ hook: prevHook, body: prevBody }, ...prev.slice(0, 9)]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentHook: editableHook || topic,
          currentBody: editableBody || facts,
          platform,
          tone,
          userMessage: msgToSend,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const { reply, revisedHook, revisedBody, revisedHashtags } = json.data;

        // If output was not open, initialize output
        if (!output) {
          setOutput({
            hook: revisedHook || "Bài viết được AI tạo mới",
            body: revisedBody || "",
            hashtags: revisedHashtags || ["#LTDPhotoClub"],
            visualTips: "Tỷ lệ chuẩn theo nền tảng đã chọn.",
            factsChecklist: ["Dữ kiện được AI cập nhật theo trao đổi."],
          });
        }

        if (revisedHook) setEditableHook(revisedHook);
        if (revisedBody) setEditableBody(revisedBody);
        if (revisedHashtags && output) {
          setOutput((prev) => (prev ? { ...prev, hashtags: revisedHashtags } : null));
        }

        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: "ai" as const,
          text: reply,
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          revisedHook,
          revisedBody,
          previousHook: prevHook,
          previousBody: prevBody,
        };

        setChatMessages((prev) => [...prev, aiMsg]);
        setSuccessToast("Đã điều chỉnh bài viết theo yêu cầu của bạn!");
        setTimeout(() => setSuccessToast(null), 3000);
      } else {
        const errorMsg = {
          id: (Date.now() + 1).toString(),
          sender: "ai" as const,
          text: json.error || "Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại!",
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        };
        setChatMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai" as const,
        text: "Lỗi kết nối máy chủ: " + err.message,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatSubmitting(false);
    }
  };

  const handleUndo = (prevHook?: string, prevBody?: string) => {
    if (prevHook !== undefined) setEditableHook(prevHook);
    if (prevBody !== undefined) setEditableBody(prevBody);
    setSuccessToast("Đã hoàn tác về phiên bản trước đó!");
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // Stats calculation
  const wordCount = editableBody.trim() ? editableBody.trim().split(/\s+/).length : 0;
  const charCount = editableBody.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-cyan-400 text-xs font-bold mb-2 border border-blue-200 dark:border-blue-900/40">
            <PenSquare className="w-3.5 h-3.5" />
            <span>AI CONTENT WRITER — {profile?.department ? profile.department.toUpperCase() : "BAN TRUYỀN THÔNG LTD"}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Trợ Lý Sáng Tạo Nội Dung Đa Kênh
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tạo bài đăng Facebook, kịch bản video TikTok 9:16, caption ảnh nghệ thuật cá nhân hóa cho từng thành viên.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shadow-sm"
          >
            <History className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Lịch Sử ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Form Input, Right Live Editor Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT: REQUEST FORM (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
            {/* PERSONALIZED AUTHOR BADGE & SIGNATURE TOGGLE */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-500 shrink-0 bg-blue-100">
                  <img
                    src={profile?.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"}
                    alt={profile?.displayName || "Tác giả"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Tác giả: {profile?.displayName || "Đỗ Quốc Thảo"}
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold truncate">
                    {profile?.role || "Chủ tịch CLB"} • {profile?.department || "Ban Kỹ thuật"}
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                <input
                  type="checkbox"
                  checked={includeAuthorSignature}
                  onChange={(e) => setIncludeAuthorSignature(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="hidden sm:inline">Chữ ký tác giả</span>
              </label>
            </div>

            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Thiết Lập Yêu Cầu Sáng Tạo</span>
            </h3>

            {/* 1. Nền Tảng */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                1. Nền tảng phát hành
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      platform === p.id
                        ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                        {p.icon}
                      </span>
                      <span className="text-xs truncate">{p.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Loại Bài Viết */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                2. Loại nội dung
              </label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              >
                {POST_TYPES.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Giọng Văn (Tone) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                3. Giọng văn (Tone of Voice)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`p-2 rounded-xl border text-xs text-left transition-all truncate ${
                      tone === t.id
                        ? "border-blue-600 bg-blue-50 text-blue-800 font-bold"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Chủ Đề Bài Viết */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                4. Chủ đề &amp; Thông điệp chính <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Chào mừng các thành viên Gen 2026 gia nhập CLB Nhiếp Ảnh LTD; hoặc Tips làm chủ ánh sáng tự nhiên khi săn bình minh..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* 5. Dữ Kiện Xác Thực (Chống Bịa Đặt) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  5. Dữ kiện xác thực (Địa điểm, giờ, diễn giả)
                </label>
                <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Chống bịa đặt
                </span>
              </div>
              <textarea
                rows={2}
                value={facts}
                onChange={(e) => setFacts(e.target.value)}
                placeholder="Nhập dữ kiện có thật: Ngày 15/11/2026, 09:00 - 11:00 tại Hội trường A. (Nếu để trống, AI sẽ cảnh báo cần xác minh)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Đang Soạn Thảo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo Nội Dung Ngay</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ================= RIGHT: LIVE RICH EDITOR WORKSPACE (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Workspace Tabs: Editor vs Chat */}
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white dark:bg-[#0c131d] border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-1.5 flex-1">
              <button
                type="button"
                onClick={() => setActiveWorkspaceTab("editor")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeWorkspaceTab === "editor"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Trình Soạn Thảo &amp; Nội Dung</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWorkspaceTab("chat")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeWorkspaceTab === "chat"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Với AI Chỉnh Sửa</span>
                {chatMessages.length > 1 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeWorkspaceTab === "chat"
                        ? "bg-white text-blue-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {chatMessages.length - 1}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Undo if history exists */}
            {versionHistory.length > 0 && (
              <button
                type="button"
                onClick={() => handleUndo(versionHistory[0]?.hook, versionHistory[0]?.body)}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Hoàn tác về phiên bản trước"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Hoàn tác ({versionHistory.length})</span>
              </button>
            )}
          </div>

          {/* TAB 1: FULL CHAT VIEW WITH FLUID ENTRY */}
          {activeWorkspaceTab === "chat" ? (
            <div key="chat-view" className="ember-page-enter rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4 flex flex-col h-[650px]">
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Trợ Lý Biên Tập AI LTD
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Chat trực tiếp để yêu cầu AI viết lại, rút gọn, đổi giọng điệu hoặc bổ sung nội dung.
                    </p>
                  </div>
                </div>

                {versionHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleUndo(versionHistory[0]?.hook, versionHistory[0]?.body)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Hoàn tác</span>
                  </button>
                )}
              </div>

              {/* Chat Messages Log */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin"
              >
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white font-bold"
                          : "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white"
                      }`}
                    >
                      {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-2 ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                          : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-sm"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {/* If AI message produced a revision */}
                      {msg.sender === "ai" && msg.revisedBody && (
                        <div className="pt-2 border-t border-slate-200/70 space-y-2">
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] space-y-1 font-mono text-slate-700 max-h-32 overflow-y-auto">
                            {msg.revisedHook && (
                              <p className="font-bold text-blue-600">{msg.revisedHook}</p>
                            )}
                            <p className="line-clamp-3">{msg.revisedBody}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveWorkspaceTab("editor")}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <PenSquare className="w-3 h-3" />
                              <span>Xem trong Trình Soạn Thảo</span>
                            </button>

                            {msg.previousBody && (
                              <button
                                type="button"
                                onClick={() => handleUndo(msg.previousHook, msg.previousBody)}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Undo2 className="w-3 h-3" />
                                <span>Hoàn tác bản này</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <span
                        className={`text-[9px] block text-right ${
                          msg.sender === "user" ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isChatSubmitting && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center animate-spin">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span>Trợ lý AI đang điều chỉnh bài viết theo yêu cầu của bạn...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="pt-2 border-t border-slate-100 space-y-2 shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  <span className="text-slate-400 font-bold shrink-0 text-[10px] uppercase">Gợi ý:</span>
                  {[
                    "✂️ Rút gọn bài viết 50%",
                    "🔥 Viết giật tít & cuốn hút hơn",
                    "🎭 Đổi giọng Gen Z hài hước",
                    "🎯 Thêm CTA đăng ký kèm link",
                    "📌 Thêm gạch đầu dòng rõ ý",
                    "✨ Sửa mở đầu gây tò mò",
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isChatSubmitting}
                      onClick={() => handleSendChatMessage(chip)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 whitespace-nowrap transition-colors font-medium cursor-pointer shrink-0"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Chat yêu cầu với AI (VD: Sửa đoạn 2 thành..., viết ngắn lại, thêm lời cảm ơn...)"
                    disabled={isChatSubmitting}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isChatSubmitting || !chatInput.trim()}
                    className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md shadow-cyan-500/20 disabled:opacity-40 transition-all cursor-pointer shrink-0"
                    title="Gửi yêu cầu chỉnh sửa"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* TAB 2: EDITOR VIEW (With integrated quick chat bar and fluid entry) */
            <div key="editor-view" className="ember-page-enter space-y-4">
              {output ? (
                <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-5">
                  {/* Top Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 uppercase">
                        {platform}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {wordCount} từ ({charCount} ký tự) · ~{readingTimeMinutes} phút đọc
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Đã chép!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleSaveToLibrary}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{isSaving ? "Đang lưu..." : "Lưu vào Thư viện"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Toast Success */}
                  {successToast && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successToast}</span>
                    </div>
                  )}

                  {/* Formatting Quick Tools */}
                  <div className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                    <span className="text-[11px] font-bold text-slate-400 uppercase mr-2">
                      Công cụ:
                    </span>
                    <button
                      onClick={() => handleFormat("bold")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700"
                      title="In đậm"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFormat("italic")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700"
                      title="In nghiêng"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFormat("bullet")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700"
                      title="Gạch đầu dòng"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFormat("quote")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700"
                      title="Trích dẫn"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 1. Hook Editor */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                      Tiêu đề giật tít / Hook 3s đầu tiên
                    </label>
                    <input
                      type="text"
                      value={editableHook}
                      onChange={(e) => setEditableHook(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-blue-50/50 border border-blue-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 2. Main Body Rich Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Nội dung chi tiết (Có thể chỉnh sửa trực tiếp)
                    </label>
                    <textarea
                      rows={11}
                      value={editableBody}
                      onChange={(e) => setEditableBody(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                    />
                  </div>

                  {/* ================= INTEGRATED AI CHAT & REFINE BAR ================= */}
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-50/70 via-indigo-50/50 to-cyan-50/60 border border-blue-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-extrabold text-xs text-slate-900">
                          Yêu Cầu AI Chỉnh Sửa Bài Viết Này
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveWorkspaceTab("chat")}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Mở phòng chat đầy đủ</span>
                        <MessageSquare className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Quick Refine Prompt Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                      {[
                        "✂️ Rút gọn bài viết",
                        "🔥 Viết cuốn hút & giật tít hơn",
                        "🎭 Đổi giọng Gen Z",
                        "🎯 Thêm CTA đăng ký form",
                        "📌 Thêm gạch đầu dòng rõ ý",
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isChatSubmitting}
                          onClick={() => handleSendChatMessage(chip)}
                          className="px-2.5 py-1 rounded-xl bg-white/90 hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200/80 whitespace-nowrap transition-all font-semibold cursor-pointer shrink-0 shadow-2xs"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {/* Integrated Chat Input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendChatMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Nói với AI điều bạn muốn sửa (VD: Viết ngắn lại, thêm giọng Gen Z, thêm kêu gọi hành động...)"
                        disabled={isChatSubmitting}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                      />
                      <button
                        type="submit"
                        disabled={isChatSubmitting || !chatInput.trim()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
                      >
                        {isChatSubmitting ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Gửi</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* 3. Hashtags */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Hashtags đề xuất
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {output.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-blue-600 text-xs font-semibold hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => setEditableBody((prev) => prev + " " + tag)}
                          title="Bấm để chèn vào bài"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 4. Visual Tips for Tech Dept */}
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                    <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                      <Camera className="w-4 h-4" />
                      <span>Gợi ý hình ảnh cho Ban Kỹ Thuật (Visual Direction)</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {output.visualTips}
                    </p>
                  </div>

                  {/* 5. Facts Checklist */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>Kiểm tra tính xác thực &amp; Lưu ý dữ kiện</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {output.factsChecklist.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className="h-full min-h-[480px] rounded-3xl bg-white border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                    <PenSquare className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Workspace Soạn Thảo Đang Sẵn Sàng
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed mt-1">
                      Hãy chọn nền tảng, nhập chủ đề và bấm &quot;Tạo Nội Dung Ngay&quot; hoặc chat trực tiếp yêu cầu với AI bên dưới.
                    </p>
                  </div>

                  {/* Direct Chat Prompt on Empty State */}
                  <div className="w-full max-w-md pt-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendChatMessage();
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-sm"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="💬 Chat yêu cầu với AI (VD: Viết caption ảnh bình minh Long Thành...)"
                        disabled={isChatSubmitting}
                        className="flex-1 px-3 py-1.5 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isChatSubmitting || !chatInput.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        {isChatSubmitting ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Gửi</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => {
                        setTopic("Tuyển thành viên Gen 2026 cho 5 Ban CLB Nhiếp Ảnh LTD");
                        setPlatform("facebook");
                        setPostType("member_recruitment");
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-[11px] font-medium text-slate-600 transition-colors"
                    >
                      💡 Mẫu: Tuyển quân Gen 2026
                    </button>
                    <button
                      onClick={() => {
                        setTopic("Workshop Chụp Ảnh Cơ Bản: Làm chủ ISO, Tốc độ màn trập và Khẩu độ");
                        setPlatform("tiktok");
                        setPostType("gear_review");
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-[11px] font-medium text-slate-600 transition-colors"
                    >
                      💡 Mẫu: Script TikTok Workshop
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Drawer / Panel */}
          {showHistory && (
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>Lịch Sử Bài Viết Đã Tạo Gần Đây</span>
                </h4>
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem("LTD_WRITER_HISTORY");
                  }}
                  className="text-[11px] text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa lịch sử</span>
                </button>
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Chưa có bài viết nào được tạo trong phiên này.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setOutput(item.content);
                        setEditableHook(item.content.hook);
                        setEditableBody(item.content.body);
                        setTopic(item.topic);
                        setPlatform(item.platform);
                      }}
                      className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-colors text-left"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-bold uppercase text-blue-600">
                          {item.platform}
                        </span>
                        <span>{item.timestamp}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {item.topic}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
