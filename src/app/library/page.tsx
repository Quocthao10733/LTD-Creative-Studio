"use client";

import * as React from "react";
import {
  BookOpen,
  Camera,
  Download,
  Palette,
  FileText,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Video,
  Sparkles,
  Search,
  Filter,
  Layers,
} from "lucide-react";
import { ContentItem } from "@/lib/types/content";

const BRAND_ASSETS = [
  {
    title: "Logo Chính Thức LTD Creative Studio (PNG & SVG)",
    category: "Brand Assets",
    desc: "Logo khẩu độ máy ảnh vector kèm chữ phong cách hiện đại trên nền sáng và nền tối.",
    size: "4.2 MB",
    type: "vector",
  },
  {
    title: "Bộ Quy Chuẩn Thương Hiệu (Brand Guidelines PDF)",
    category: "Guidelines",
    desc: "Quy chuẩn mã màu Deep Navy (#091322), Cyan (#06b6d4), khoảng cách an toàn và typography.",
    size: "12.8 MB",
    type: "pdf",
  },
  {
    title: "Preset Màu Lightroom 'LTD Sương Sớm Phước Lý'",
    category: "Presets",
    desc: "Bộ lọc màu ảnh phong cảnh trong trẻo, khử ám vàng và tăng độ trong trẻo cho ảnh ban mai.",
    size: "1.5 MB",
    type: "preset",
  },
  {
    title: "LUT Màu DaVinci Resolve 'Cinematic Warmth'",
    category: "Presets",
    desc: "Cube LUTs 33x33 chuẩn Rec.709 cho video phóng sự và chân dung của Ban Kỹ Thuật.",
    size: "850 KB",
    type: "lut",
  },
];

export default function LibraryPage() {
  const [savedPosts, setSavedPosts] = React.useState<ContentItem[]>([]);
  const [loadingPosts, setLoadingPosts] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"posts" | "assets">("posts");
  const [searchQuery, setSearchQuery] = React.useState("");

  const fetchSavedPosts = React.useCallback(async () => {
    try {
      setLoadingPosts(true);
      const res = await fetch("/api/content");
      const json = await res.json();
      if (json.success) {
        setSavedPosts(json.data);
      }
    } catch (err) {
      console.error("Lỗi tải bài viết đã lưu:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  const handleDeletePost = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này khỏi thư viện?")) return;
    try {
      const res = await fetch(`/api/content?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSavedPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      alert("Lỗi khi xóa bài viết!");
    }
  };

  const handleCopyPost = (item: ContentItem) => {
    const text = `${item.hook}\n\n${item.body}\n\n${item.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPosts = savedPosts.filter(
    (p) =>
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>THƯ VIỆN TÀI NGUYÊN &amp; BRAND KIT — CLB NHIẾP ẢNH LTD</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Kho Tài Sản Sáng Tạo &amp; Bài Viết Đã Lưu
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Lưu trữ bản thảo bài đăng Facebook, kịch bản TikTok, preset màu Lightroom và logo thương hiệu chính thức.
          </p>
        </div>

        {/* Tab switch */}
        <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold flex shrink-0">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "posts"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Bài Viết Đã Lưu ({savedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("assets")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === "assets"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Brand Kit &amp; Presets ({BRAND_ASSETS.length})
          </button>
        </div>
      </div>

      {activeTab === "posts" ? (
        /* ================= SAVED POSTS ================= */
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài viết đã lưu..."
                className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Tổng cộng: <strong>{filteredPosts.length}</strong> bài viết
            </span>
          </div>

          {loadingPosts ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Đang tải danh sách bài viết từ thư viện...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">
                Thư viện bài viết đang trống
              </h4>
              <p className="text-xs text-slate-500">
                Hãy sử dụng <strong>AI Content Writer</strong> để soạn thảo và bấm &quot;Lưu vào Thư viện&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white border border-slate-100 hover:border-blue-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 uppercase">
                        {item.platform}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                      {item.title || item.hook}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.body}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.hashtags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyPost(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Đã sao chép!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép nội dung</span>
                          </>
                        )}
                      </button>

                      {(item as any).canvaUrl && (
                        <a
                          href={(item as any).canvaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 text-[10px] font-bold transition"
                          title="Mở chỉnh sửa trực tiếp trên Canva"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Mở trên Canva</span>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeletePost(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Xóa bài"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= BRAND ASSETS & PRESETS ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BRAND_ASSETS.map((asset, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-4"
            >
              <div className="space-y-2 min-w-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                  {asset.category}
                </span>
                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {asset.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {asset.desc}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Dung lượng: {asset.size}
                </span>
              </div>

              <button
                onClick={() => alert(`Đang tải tài sản "${asset.title}"...`)}
                className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shrink-0 shadow-sm"
                title="Tải về"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
