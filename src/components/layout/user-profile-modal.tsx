"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  Shield,
  Save,
  LogOut,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

// Kho avatar mẫu phong cách nhiếp ảnh gia CLB LTD
const SUGGESTED_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
];

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, profile, logout, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.displayName || "Đỗ Quốc Thảo");
  const [department, setDepartment] = useState<"Ban Truyền thông" | "Ban Kỹ thuật">(
    profile?.department || "Ban Kỹ thuật"
  );
  const [role, setRole] = useState<"Chủ tịch CLB" | "Trưởng Ban" | "Phó Ban" | "Thành viên">(
    profile?.role || "Chủ tịch CLB"
  );
  const [phone, setPhone] = useState(profile?.phone || "0785242404");
  const [avatarPreview, setAvatarPreview] = useState(
    profile?.photoURL || SUGGESTED_AVATARS[0]
  );
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Xử lý khi người dùng chọn file ảnh từ máy tính
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh (JPG, PNG, WebP)!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setAvatarPreview(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Lưu hồ sơ và đồng bộ lên Cloud (Firebase Realtime Database)
  const handleSaveProfile = async () => {
    setIsSaving(true);
    const updatedProfile = {
      uid: profile?.uid || user?.uid || `user-${Date.now()}`,
      email: profile?.email || user?.email || "dothao783@gmail.com",
      displayName: displayName.trim() || "Thành viên LTD",
      department,
      role,
      phone: phone.trim(),
      photoURL: avatarPreview,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await updateUserProfile(updatedProfile);
    setIsSaving(false);
    setSaveToast("Đã đồng bộ ảnh đại diện và hồ sơ cá nhân lên máy tính & điện thoại!");
    setTimeout(() => {
      setSaveToast(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0c131d] rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Hồ Sơ & Ảnh Đại Diện Cá Nhân
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải ảnh chân dung của bạn để cá nhân hóa toàn bộ tính năng CLB LTD
          </p>
        </div>

        {/* Thông báo lưu thành công */}
        {saveToast && (
          <div className="my-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{saveToast}</span>
          </div>
        )}

        <div className="py-4 space-y-4">
          {/* KHU VỰC TẢI ẢNH ĐẠI DIỆN */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-blue-500 shadow-xl bg-slate-100 dark:bg-slate-800">
                <img
                  src={avatarPreview}
                  alt={displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition">
                <Upload className="w-5 h-5 mb-0.5" />
                <span>Đổi ảnh</span>
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 text-white shadow-md border-2 border-white dark:border-slate-900">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải ảnh từ máy tính của bạn</span>
            </button>

            {/* Gợi ý ảnh nhanh */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Hoặc chọn:</span>
              <div className="flex gap-1.5">
                {SUGGESTED_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarPreview(url)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition ${
                      avatarPreview === url ? "border-blue-500 scale-110 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="suggested" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FORM THÔNG TIN CÁ NHÂN HÓA */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Họ và Tên hiển thị
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ban phụ trách
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
                >
                  <option value="Ban Truyền thông">Ban Truyền thông</option>
                  <option value="Ban Kỹ thuật">Ban Kỹ thuật</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chức vụ
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
                >
                  <option value="Chủ tịch CLB">Chủ tịch CLB</option>
                  <option value="Trưởng Ban">Trưởng Ban</option>
                  <option value="Phó Ban">Phó Ban</option>
                  <option value="Thành viên">Thành viên</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Số điện thoại / Zalo
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-blue-500"
              />
            </div>
          </div>

          {/* NÚT THAO TÁC */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
