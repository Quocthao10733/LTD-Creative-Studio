"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Palette,
  Sparkles,
  ExternalLink,
  Maximize2,
  Calendar,
  Save,
  Grid,
  Link as LinkIcon,
  HelpCircle,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  Info,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Copy,
  Eye,
} from "lucide-react";
import { PresetRatioId, CANVAS_PRESETS, CanvaTemplateItem, CanvaCustomClubLink } from "@/lib/types/design";
import { useAuth } from "@/context/auth-context";

// Danh mục mẫu Canva chính thức chuẩn tỉ lệ và chủ đề của CLB LTD
const CANVA_CURATED_TEMPLATES: CanvaTemplateItem[] = [
  {
    id: "canva-ws-basic",
    title: "Workshop Nhiếp Ảnh Cơ Bản",
    category: "workshop",
    ratioId: "fb-square",
    canvaTemplateUrl: "https://www.canva.com/templates/?query=photography+workshop+poster",
    previewImage:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    badge: "1:1 Feed Vuông (1080x1080)",
    description: "Mẫu bố cục chuyên đề ánh sáng, kỹ thuật chụp máy ảnh DSLR/Mirrorless",
  },
  {
    id: "canva-pt-sunset",
    title: "Photo Trip Săn Ảnh Hoàng Hôn",
    category: "phototrip",
    ratioId: "fb-portrait",
    canvaTemplateUrl: "https://www.canva.com/templates/?query=photo+tour+poster",
    previewImage:
      "https://images.unsplash.com/photo-1502982720700-bfff97f2da6d?auto=format&fit=crop&w=800&q=80",
    badge: "4:5 Mobile Feed (1080x1350)",
    description: "Mẫu poster dã ngoại ngoại cảnh ven sông, tông màu hoàng hôn ấm áp",
  },
  {
    id: "canva-rec-gen3",
    title: "Tuyển Thành Viên: Welcome Gen 3",
    category: "recruitment",
    ratioId: "story-tiktok",
    canvaTemplateUrl: "https://www.canva.com/templates/?query=club+recruitment+story",
    previewImage:
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80",
    badge: "9:16 Story/TikTok (1080x1920)",
    description: "Mẫu tuyển quân năng động, hiện đại cho Ban Truyền thông & Kỹ thuật",
  },
  {
    id: "canva-cover-gala",
    title: "Banner Sự Kiện & Triển Lãm LTD",
    category: "cover",
    ratioId: "event-cover",
    canvaTemplateUrl: "https://www.canva.com/templates/?query=photography+exhibition+banner",
    previewImage:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    badge: "16:9 Event Cover (1920x1080)",
    description: "Ảnh bìa Facebook Event, Gala tổng kết và triển lãm ảnh nghệ thuật",
  },
];

// Danh sách mẫu link Canva riêng của CLB LTD được ghim sẵn
const DEFAULT_CLUB_CANVA_LINKS: CanvaCustomClubLink[] = [
  {
    id: "link-01",
    title: "Mẫu Poster Workshop Chuẩn LTD (Chính thức)",
    url: "https://www.canva.com/templates/?query=photography+workshop",
    category: "Workshop",
    author: "Quốc Thảo - Ban Truyền thông",
    updatedAt: "2026-11-20",
  },
  {
    id: "link-02",
    title: "Bộ Khung Story & Reels Thông Báo",
    url: "https://www.canva.com/templates/?query=photography+social+story",
    category: "Story / TikTok",
    author: "Ban Kỹ thuật",
    updatedAt: "2026-11-18",
  },
];

function DesignStudioContent() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get("title") || "Workshop Nhiếp Ảnh Cơ Bản";
  const initialTopic = searchParams.get("topic") || "";
  const paramAuthor = searchParams.get("author") || profile?.displayName || "Đỗ Quốc Thảo";

  // Trạng thái giao diện
  const [activeRatio, setActiveRatio] = useState<PresetRatioId>("fb-square");
  const [selectedTemplate, setSelectedTemplate] = useState<CanvaTemplateItem>(CANVA_CURATED_TEMPLATES[0]);
  const [activeTab, setActiveTab] = useState<"canva" | "templates" | "club-links">("canva");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Link Canva đang mở
  const [currentCanvaUrl, setCurrentCanvaUrl] = useState<string>(
    CANVA_CURATED_TEMPLATES[0].canvaTemplateUrl
  );

  // Link Embed tương tác (nếu có đuôi /view?embed)
  const [customEmbedUrl, setCustomEmbedUrl] = useState<string>("");
  const [isViewingEmbed, setIsViewingEmbed] = useState<boolean>(false);

  // Danh sách link riêng của CLB (lưu trong localStorage)
  const [clubLinks, setClubLinks] = useState<CanvaCustomClubLink[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("LTD_CANVA_CLUB_LINKS");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_CLUB_CANVA_LINKS;
  });

  // Form thêm link mới của CLB
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkCategory, setNewLinkCategory] = useState("Workshop");

  // Form Đồng bộ kép về Thư viện & Lịch
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncForm, setSyncForm] = useState({
    title: initialTitle,
    canvaUrl: currentCanvaUrl,
    imageUrl: selectedTemplate.previewImage,
    category: "Workshop",
    department: profile?.department === "Ban Kỹ thuật" ? "TECH" : "COMM",
    author: paramAuthor,
    scheduleDate: "2026-11-25",
    scheduleTime: "09:00",
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Mở Canva trong cửa sổ chuyên dụng (Popup Window)
  const handleOpenCanvaPopup = (urlToOpen?: string) => {
    const targetUrl = urlToOpen || currentCanvaUrl;
    const width = 1366;
    const height = 850;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      targetUrl,
      "CanvaStudioWindow",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
    );
    showToast("Đã mở cửa sổ thiết kế Canva Studio!");
  };

  // Cập nhật khi đổi template
  const handleSelectTemplate = (tpl: CanvaTemplateItem) => {
    setSelectedTemplate(tpl);
    setActiveRatio(tpl.ratioId);
    setCurrentCanvaUrl(tpl.canvaTemplateUrl);
    setSyncForm((prev) => ({
      ...prev,
      title: tpl.title,
      canvaUrl: tpl.canvaTemplateUrl,
      imageUrl: tpl.previewImage,
    }));
    setActiveTab("canva");
    setIsViewingEmbed(false);
    showToast(`Đã chọn mẫu: "${tpl.title}"`);
  };

  // Mở link Canva riêng
  const handleOpenClubLink = (link: CanvaCustomClubLink) => {
    setCurrentCanvaUrl(link.url);
    setSyncForm((prev) => ({
      ...prev,
      title: link.title,
      canvaUrl: link.url,
    }));
    setActiveTab("canva");
    if (link.url.includes("/view?embed") || link.url.includes("embed")) {
      setCustomEmbedUrl(link.url);
      setIsViewingEmbed(true);
    } else {
      setIsViewingEmbed(false);
    }
    showToast(`Đã nạp link: "${link.title}"`);
  };

  // Thêm link Canva riêng mới
  const handleAddClubLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    const newItem: CanvaCustomClubLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim(),
      category: newLinkCategory,
      author: "Ban Truyền thông CLB",
      updatedAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newItem, ...clubLinks];
    setClubLinks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("LTD_CANVA_CLUB_LINKS", JSON.stringify(updated));
    }
    setNewLinkTitle("");
    setNewLinkUrl("");
    showToast("Đã lưu mẫu Canva vào danh sách CLB!");
  };

  // Xóa link Canva riêng
  const handleDeleteClubLink = (id: string) => {
    const updated = clubLinks.filter((l) => l.id !== id);
    setClubLinks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("LTD_CANVA_CLUB_LINKS", JSON.stringify(updated));
    }
    showToast("Đã xóa liên kết!");
  };

  // Thực hiện Đồng bộ kép (Lưu vào Thư viện LTD + Xếp Lịch)
  const handleExecuteSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);

    try {
      const res = await fetch("/api/design/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: syncForm.title,
          canvaUrl: syncForm.canvaUrl,
          backgroundImage: syncForm.imageUrl,
          previewImage: syncForm.imageUrl,
          presetId: activeRatio,
          width: CANVAS_PRESETS[activeRatio].width,
          height: CANVAS_PRESETS[activeRatio].height,
          author: syncForm.department === "TECH" ? "Ban Kỹ thuật" : "Ban Truyền thông",
          scheduleDate: syncForm.scheduleDate,
          scheduleTime: syncForm.scheduleTime,
          department: syncForm.department,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSyncModalOpen(false);
        showToast("Đồng bộ thành công vào Thư viện LTD & Lịch nội dung!");
      } else {
        showToast("Lỗi khi lưu dữ liệu!");
      }
    } catch (err) {
      console.error("Lỗi sync:", err);
      showToast("Lỗi kết nối máy chủ!");
    } finally {
      setIsSyncing(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentPreset = CANVAS_PRESETS[activeRatio] || CANVAS_PRESETS["fb-square"];

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex flex-col">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B132B] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-500/30 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER TOOLBAR LTD STUDIO */}
      <header className="min-h-16 py-2.5 bg-white dark:bg-[#0c131d] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs sm:text-sm font-medium transition"
          >
            <span>← Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm font-black text-xs shrink-0">
              CANVA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-xs">{syncForm.title}</h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300">
                  Canva Official Studio
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                {currentPreset.name} • {currentPreset.width}x{currentPreset.height} px
              </p>
            </div>
          </div>
        </div>

        {/* NÚT THAO TÁC TRÊN ĐẦU */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tỉ lệ Preset */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-0.5 sm:gap-1">
            {(Object.keys(CANVAS_PRESETS) as PresetRatioId[]).map((pid) => {
              const p = CANVAS_PRESETS[pid];
              const isActive = activeRatio === pid;
              return (
                <button
                  key={pid}
                  onClick={() => {
                    setActiveRatio(pid);
                    setCurrentCanvaUrl(
                      `https://www.canva.com/templates/?query=photography+${encodeURIComponent(
                        p.platform
                      )}`
                    );
                    setIsViewingEmbed(false);
                    showToast(`Đã chuyển sang ${p.aspectRatio} (${p.name})`);
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title={p.description}
                >
                  {p.aspectRatio}
                </button>
              );
            })}
          </div>

          {/* Nút Mở Canva Cửa Sổ Riêng */}
          <button
            onClick={() => handleOpenCanvaPopup()}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            title="Mở trong cửa sổ chuyên dụng không bị giới hạn"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Mở Cửa Sổ Canva</span>
            <span className="sm:hidden">Canva</span>
          </button>

          {/* Nút Đồng bộ kép về Thư viện CLB */}
          <button
            onClick={() => setSyncModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Thư Viện</span>
          </button>
        </div>
      </header>

      {/* THÂN WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* THANH BẢNG ĐIỀU KHIỂN BÊN TRÁI */}
        <aside className="w-full lg:w-88 max-h-[40vh] lg:max-h-none bg-white dark:bg-[#0c131d] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xs shrink-0">
          {/* Menu Tab */}
          <div className="flex border-b border-slate-200 bg-slate-50/60 p-1.5 gap-1">
            <button
              onClick={() => setActiveTab("canva")}
              className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg text-xs font-bold gap-1.5 transition ${
                activeTab === "canva"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Canva Hub</span>
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg text-xs font-bold gap-1.5 transition ${
                activeTab === "templates"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Mẫu Tuyển Chọn</span>
            </button>
            <button
              onClick={() => setActiveTab("club-links")}
              className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg text-xs font-bold gap-1.5 transition ${
                activeTab === "club-links"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Link Riêng ({clubLinks.length})</span>
            </button>
          </div>

          {/* NỘI DUNG TỪNG TAB */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: THÔNG TIN CANVA & TÌM KIẾM NHANH */}
            {activeTab === "canva" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-indigo-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Canva Studio CLB LTD
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sử dụng toàn bộ kho hàng triệu template, font chữ nghệ thuật, sticker nhiếp ảnh và công cụ AI Canva Magic Studio.
                  </p>
                </div>

                {/* Khung Nhúng Link Embed Trực Tiếp */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Eye className="w-4 h-4 text-cyan-600" />
                    <span>Nhúng Link Embed Canva Của Bạn</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Dán link chia sẻ dạng nhúng của Canva (có đuôi <code>/view?embed</code>) để hiển thị tương tác trực tiếp:
                  </p>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://www.canva.com/design/.../view?embed"
                      value={customEmbedUrl}
                      onChange={(e) => setCustomEmbedUrl(e.target.value)}
                      className="flex-1 text-xs p-2 rounded-xl border border-slate-200 focus:outline-blue-500 bg-slate-50"
                    />
                    <button
                      onClick={() => {
                        if (customEmbedUrl.trim()) {
                          setCurrentCanvaUrl(customEmbedUrl.trim());
                          setIsViewingEmbed(true);
                          showToast("Đang nạp bản thiết kế Canva!");
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      Nhúng
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tìm kiếm mẫu Canva theo chuyên đề
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      {
                        title: "Mẫu Workshop Bố Cục & Ánh Sáng",
                        query: "photography workshop poster",
                      },
                      {
                        title: "Mẫu Tuyển Thành Viên Ban Truyền Thông",
                        query: "club recruitment social poster",
                      },
                      {
                        title: "Mẫu Triển Lãm & Cuộc Thi Ảnh",
                        query: "photo exhibition gallery poster",
                      },
                      {
                        title: "Mẫu Dã Ngoại & Photo Trip Hoàng Hôn",
                        query: "photo tour dslr poster",
                      },
                      {
                        title: "Mẫu Story Facebook & TikTok",
                        query: "photography instagram story",
                      },
                    ].map((item) => (
                      <button
                        key={item.title}
                        onClick={() => {
                          const url = `https://www.canva.com/templates/?query=${encodeURIComponent(
                            item.query
                          )}`;
                          setCurrentCanvaUrl(url);
                          setIsViewingEmbed(false);
                          handleOpenCanvaPopup(url);
                        }}
                        className="w-full text-left p-2.5 text-xs text-slate-700 hover:bg-blue-50/60 rounded-xl border border-slate-200/80 transition flex items-center justify-between group"
                      >
                        <span className="font-medium">{item.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Lưu ý bảo mật từ Canva:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Canva áp dụng chính sách bảo mật trình duyệt chặn nhúng iframe với trang tìm kiếm tự do. Sử dụng nút <strong>"Mở Cửa Sổ Canva"</strong> để có đầy đủ 100% tính năng mượt mà nhất mà không bị chặn!
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: DANH MỤC TEMPLATE CHUẨN CLB */}
            {activeTab === "templates" && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mẫu Thiết Kế Tuyển Chọn Của CLB
                </h3>
                {CANVA_CURATED_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className="cursor-pointer group rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-500 hover:shadow-md transition bg-white"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={tpl.previewImage}
                        alt={tpl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                          {tpl.badge}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {tpl.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: QUẢN LÝ LINK TEMPLATE RIÊNG CỦA BAN TRUYỀN THÔNG */}
            {activeTab === "club-links" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Thêm Mẫu Canva Của Riêng Bạn
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                    Dán link thiết kế Canva Pro của bạn để mọi thành viên trong CLB có thể bấm mở sửa ngay lập tức!
                  </p>

                  <form onSubmit={handleAddClubLink} className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Tên mẫu (VD: Poster Khai Giảng Khóa 3)"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500 bg-white"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Link thiết kế Canva (https://www.canva.com/...)"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500 bg-white"
                      required
                    />
                    <select
                      value={newLinkCategory}
                      onChange={(e) => setNewLinkCategory(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500 bg-white"
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Photo Trip">Photo Trip</option>
                      <option value="Tuyển Thành Viên">Tuyển Thành Viên</option>
                      <option value="Story / TikTok">Story / TikTok</option>
                      <option value="Khác">Khác</option>
                    </select>

                    <button
                      type="submit"
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lưu Mẫu Vào Danh Sách CLB</span>
                    </button>
                  </form>
                </div>

                {/* Danh sách link đã lưu */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mẫu đã lưu ({clubLinks.length})
                  </h4>

                  {clubLinks.map((link) => (
                    <div
                      key={link.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-500 transition group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="cursor-pointer flex-1"
                          onClick={() => handleOpenClubLink(link)}
                        >
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                            {link.category}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition mt-1">
                            {link.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">{link.author}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenCanvaPopup(link.url)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition"
                            title="Mở trong cửa sổ riêng"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClubLink(link.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition"
                            title="Xóa mẫu này"
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
        </aside>

        {/* WORKSPACE TRUNG TÂM */}
        <main className="flex-1 flex flex-col bg-[#0B132B] relative overflow-auto p-6 items-center justify-center">
          {/* NẾU LÀ LINK EMBED HỢP LỆ -> RENDER IFRAME TRỰC TIẾP */}
          {isViewingEmbed && customEmbedUrl ? (
            <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative">
              <iframe
                src={customEmbedUrl}
                title="Canva Embed View"
                className="w-full h-full border-0"
                allow="fullscreen; clipboard-read; clipboard-write"
              />
            </div>
          ) : (
            /* NẾU CHƯA CÓ LINK EMBED -> HIỂN THỊ CANVA LAUNCHPAD TRỰC QUAN CAO CẤP */
            <div className="max-w-2xl w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 font-black text-xl">
                C
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {currentPreset.name} • {currentPreset.aspectRatio} ({currentPreset.width}x{currentPreset.height} px)
                </span>
                <h2 className="text-xl font-black text-white">
                  Trung Tâm Thiết Kế Canva CLB Nhiếp Ảnh LTD
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Thiết kế với hàng triệu mẫu poster nhiếp ảnh, kho đồ họa camera chuyên nghiệp và các công cụ AI Magic Studio của Canva.
                </p>
              </div>

              {/* Nút Khởi Chạy Lớn */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => handleOpenCanvaPopup()}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Mở Canva Thiết Kế Ngay (Cửa Sổ Riêng)</span>
                </button>

                <button
                  onClick={() => setSyncModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 text-cyan-400" />
                  <span>Đồng Bộ Về Thư Viện CLB</span>
                </button>
              </div>

              {/* Thẻ Mẫu Đang Chọn */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left flex items-center gap-4">
                <img
                  src={selectedTemplate.previewImage}
                  alt={selectedTemplate.title}
                  className="w-20 h-14 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{selectedTemplate.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => handleOpenCanvaPopup(selectedTemplate.canvaTemplateUrl)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold border border-blue-500/30 transition shrink-0"
                >
                  Mở Mẫu Này
                </button>
              </div>

              {/* Hướng Dẫn 3 Bước */}
              <div className="pt-2 grid grid-cols-3 gap-3 text-left border-t border-slate-800">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <span className="text-[10px] font-black text-cyan-400">BƯỚC 1</span>
                  <p className="text-[11px] font-semibold text-slate-200 mt-1">Bấm Mở Canva</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mở cửa sổ Canva chỉnh sửa chữ, ảnh, logo</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <span className="text-[10px] font-black text-cyan-400">BƯỚC 2</span>
                  <p className="text-[11px] font-semibold text-slate-200 mt-1">Tải Ảnh Hoặc Copy Link</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Bấm Share → Download ảnh hoặc lấy Link</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <span className="text-[10px] font-black text-cyan-400">BƯỚC 3</span>
                  <p className="text-[11px] font-semibold text-slate-200 mt-1">Đồng Bộ Về CLB</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Lưu vào Thư viện và xếp Lịch tự động</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL ĐỒNG BỘ KÉP VỀ THƯ VIỆN CLB VÀ XẾP LỊCH */}
      {syncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Save className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Đồng Bộ Thiết Kế Về CLB LTD
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lưu trữ đồng thời Ảnh thành phẩm và Link Canva để sửa lại sau này
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSyncModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSync} className="py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề ấn phẩm / sự kiện
                </label>
                <input
                  type="text"
                  value={syncForm.title}
                  onChange={(e) => setSyncForm({ ...syncForm, title: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đường Link thiết kế Canva (để mở sửa lại sau này)
                </label>
                <input
                  type="url"
                  value={syncForm.canvaUrl}
                  onChange={(e) => setSyncForm({ ...syncForm, canvaUrl: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
                  placeholder="https://www.canva.com/design/..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link ảnh thành phẩm (hoặc ảnh xem trước)
                </label>
                <input
                  type="url"
                  value={syncForm.imageUrl}
                  onChange={(e) => setSyncForm({ ...syncForm, imageUrl: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ban phụ trách
                  </label>
                  <select
                    value={syncForm.department}
                    onChange={(e) =>
                      setSyncForm({ ...syncForm, department: e.target.value as "COMM" | "TECH" })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
                  >
                    <option value="COMM">Ban Truyền Thông</option>
                    <option value="TECH">Ban Kỹ Thuật</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày đăng (Đưa vào Lịch)
                  </label>
                  <input
                    type="date"
                    value={syncForm.scheduleDate}
                    onChange={(e) => setSyncForm({ ...syncForm, scheduleDate: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSyncModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đồng Ý & Lưu Vào Thư Viện</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DesignPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F0F4FA]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Đang nạp Canva Studio...</p>
          </div>
        </div>
      }
    >
      <DesignStudioContent />
    </Suspense>
  );
}
