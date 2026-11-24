"use client";

import * as React from "react";
import {
  X,
  UploadCloud,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Check,
  Camera,
  Grid,
  UserCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Member, DEPARTMENTS } from "@/lib/types/member";

interface MemberPhotoCropperModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedMember: Member) => void;
}

export function MemberPhotoCropperModal({
  member,
  isOpen,
  onClose,
  onSaveSuccess,
}: MemberPhotoCropperModalProps) {
  const [imageSrc, setImageSrc] = React.useState<string>(member.avatar || "");
  const [zoom, setZoom] = React.useState<number>(1);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = React.useState<number>(0);
  const [showGrid, setShowGrid] = React.useState<boolean>(true);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const [successMsg, setSuccessMsg] = React.useState<string>("");
  const [tab, setTab] = React.useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = React.useState<string>("");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  // Reset when modal opens for a new member
  React.useEffect(() => {
    if (isOpen) {
      setImageSrc(member.avatar || "");
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      setErrorMsg("");
      setSuccessMsg("");
      setUrlInput("");
    }
  }, [isOpen, member]);

  if (!isOpen) return null;

  const deptInfo = DEPARTMENTS[member.department] || DEPARTMENTS.COMM;

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WebP)!");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("Kích thước ảnh tối đa là 8MB!");
      return;
    }

    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  // Quick Preset Alignments
  const handleAlignFace = () => {
    // Face portrait: Move photo down so the head/face is in the upper 2/3 of frame
    setZoom((prev) => Math.max(prev, 1.25));
    setPan({ x: 0, y: 45 });
  };

  const handleAlignCenter = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Mouse / Touch Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile / tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 3.0));
  };

  // Export cropped image via Canvas and Save
  const handleSaveCroppedImage = async () => {
    if (!imageSrc) {
      setErrorMsg("Vui lòng tải lên một ảnh để căn chỉnh!");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      // Create an offscreen image element to read true dimensions
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Không thể tải hình ảnh để xử lý"));
      });

      // Canvas target size: 500x500 high-res avatar
      const canvas = document.createElement("canvas");
      const TARGET_SIZE = 500;
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Không thể khởi tạo bộ xử lý hình ảnh Canvas");
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Viewport dimension is 260px in UI
      const VIEWPORT_SIZE = 260;
      const scaleMultiplier = TARGET_SIZE / VIEWPORT_SIZE;

      // Base dimensions to cover the 260x260 box
      const aspect = img.naturalWidth / img.naturalHeight;
      let drawW: number;
      let drawH: number;

      if (aspect > 1) {
        // Landscape
        drawH = VIEWPORT_SIZE * zoom;
        drawW = drawH * aspect;
      } else {
        // Portrait or square
        drawW = VIEWPORT_SIZE * zoom;
        drawH = drawW / aspect;
      }

      // Center + Pan
      const centerX = TARGET_SIZE / 2 + pan.x * scaleMultiplier;
      const centerY = TARGET_SIZE / 2 + pan.y * scaleMultiplier;

      // Handle rotation
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);

      const finalW = drawW * scaleMultiplier;
      const finalH = drawH * scaleMultiplier;

      ctx.drawImage(img, -finalW / 2, -finalH / 2, finalW, finalH);
      ctx.restore();

      // Export as high quality JPEG Data URL
      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);

      // Save to server
      const res = await fetch("/api/members/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          avatar: croppedDataUrl,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(`Đã căn chỉnh và lưu ảnh thành công cho ${member.name}!`);
        setTimeout(() => {
          onSaveSuccess(json.member);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(json.error || "Lỗi lưu ảnh đại diện");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Lỗi xử lý hình ảnh");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto select-none"
      >
        {/* Header: Dedicated to this specific member */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Căn Chỉnh Ảnh Thẻ — {member.name}
                </h3>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${deptInfo.badgeBg}`}>
                  {deptInfo.shortName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kéo thả ảnh để căn vị trí khuôn mặt, phóng to / thu nhỏ và xem trước trực tiếp trên thẻ.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Source Switch: File Upload vs URL */}
        <div className="flex items-center justify-between gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
          />

          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600 flex-1">
            <button
              type="button"
              onClick={() => setTab("file")}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                tab === "file" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              📁 Chọn ảnh từ thiết bị
            </button>
            <button
              type="button"
              onClick={() => setTab("url")}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                tab === "url" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              🔗 Dán link ảnh online
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Tải file khác</span>
          </button>
        </div>

        {tab === "url" && (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Dán đường dẫn ảnh: https://example.com/photo.jpg"
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => {
                if (urlInput.trim()) {
                  setImageSrc(urlInput.trim());
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Áp dụng
            </button>
          </div>
        )}

        {/* Main Work Area: Interactive Cropper + Live Card Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* LEFT: Interactive Viewport with Rule-of-Thirds Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-blue-600" />
                <span>Kéo ảnh để căn bố cục</span>
              </span>
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg transition-colors ${
                  showGrid ? "bg-blue-100 text-blue-700 font-bold" : "bg-slate-100 text-slate-500"
                }`}
                title="Bật/Tắt đường lưới bố cục quy tắc 1/3"
              >
                <Grid className="w-3 h-3" />
                <span>Lưới 1/3</span>
              </button>
            </div>

            {/* Viewport Box (260x260) */}
            <div
              ref={viewportRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              className="relative w-[260px] h-[260px] mx-auto rounded-3xl overflow-hidden border-2 border-blue-500 bg-slate-900 shadow-inner cursor-grab active:cursor-grabbing touch-none select-none"
            >
              {/* The Draggable Image */}
              {imageSrc ? (
                <div
                  className="w-full h-full flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transition: isDragging ? "none" : "transform 0.08s ease-out",
                  }}
                >
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Crop target"
                    className="max-w-none pointer-events-none"
                    style={{
                      maxHeight: "260px",
                    }}
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <Camera className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-xs">Chưa có ảnh. Vui lòng chọn ảnh để căn chỉnh.</p>
                </div>
              )}

              {/* Photography Rule-of-Thirds Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none border border-white/20">
                  {/* Vertical lines */}
                  <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-white/30 border-r border-black/20" />
                  <div className="absolute top-0 bottom-0 left-2/3 w-[1px] bg-white/30 border-r border-black/20" />
                  {/* Horizontal lines */}
                  <div className="absolute left-0 right-0 top-1/3 h-[1px] bg-white/30 border-b border-black/20" />
                  <div className="absolute left-0 right-0 top-2/3 h-[1px] bg-white/30 border-b border-black/20" />
                </div>
              )}

              {/* Corner badge guidance */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-[10px] text-white/90 backdrop-blur-sm pointer-events-none">
                {Math.round(zoom * 100)}%
              </div>
            </div>

            {/* Viewport Zoom & Quick Action Controls */}
            <div className="space-y-2 pt-1">
              {/* Zoom Slider */}
              <div className="flex items-center gap-2.5 px-1">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(1, prev - 0.1))}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                  title="Phóng to"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 ml-1"
                  title="Xoay 90 độ"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAlignFace}
                  className="flex-1 min-w-[90px] py-1.5 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Căn lấy mặt</span>
                </button>
                <button
                  type="button"
                  onClick={handleAlignCenter}
                  className="flex-1 min-w-[80px] py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors text-center"
                >
                  Căn giữa
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  title="Đặt lại"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Mặc định</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview on the Actual Member Card */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Xem trước thẻ của {member.name}</span>
            </div>

            {/* Exactly the Card from the UI */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                {/* Simulated 14x14 Avatar with exact pan and zoom applied */}
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                  {imageSrc ? (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        transform: `translate(${(pan.x * 56) / 260}px, ${(pan.y * 56) / 260}px) scale(${zoom}) rotate(${rotation}deg)`,
                      }}
                    >
                      <img
                        src={imageSrc}
                        alt={member.name}
                        className="max-w-none"
                        style={{ maxHeight: "56px" }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-base">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 font-medium">
                  {member.joinedDate}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  {member.name}
                </h4>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  {member.role}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${deptInfo.badgeBg}`}>
                    {deptInfo.shortName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                    {member.generation}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {member.bio}
              </p>
            </div>

            {/* Notice guidance */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
              💡 <strong>Mẹo nhiếp ảnh:</strong> Dùng chuột kéo ảnh sao cho <strong>đôi mắt hoặc khuôn mặt</strong> nằm ở đường lưới 1/3 phía trên để ảnh thẻ trông cân đối và chuyên nghiệp nhất.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSaveCroppedImage}
            disabled={submitting || !imageSrc}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-cyan-500/25 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý &amp; Lưu ảnh...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Lưu Bố Cục Ảnh Cho {member.name}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
