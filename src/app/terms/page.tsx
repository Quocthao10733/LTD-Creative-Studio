"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Camera,
  FileCheck,
  Scale,
  AlertCircle,
  ArrowLeft,
  Share2,
  Eye,
  CheckCircle2,
} from "lucide-react";

export default function TermsAndSecurityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 px-4 sm:px-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Dashboard</span>
        </Link>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-900">
          Chính sách chính thức • Phiên bản 2026
        </span>
      </div>

      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#10203b] to-[#162d54] text-white shadow-xl border border-blue-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-cyan-300 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>LONG THÀNH DIGITAL PHOTO CLUB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Điều Khoản Sử Dụng, Bảo Vệ Bản Quyền &amp; An Toàn Dữ Liệu
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Quy định pháp lý và quy chuẩn nội bộ nhằm bảo vệ tuyệt đối quyền sở hữu trí tuệ của từng tác giả thành viên, tính toàn vẹn của dữ liệu và hệ thống AI LTD Creative Studio.
          </p>
        </div>
      </div>

      {/* Main Sections */}
      <div className="space-y-6">
        {/* ĐIỀU 1: BẢN QUYỀN TÁC PHẨM NHIẾP ẢNH & THIẾT KẾ */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-cyan-400">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                1. Quyền Sở Hữu Trí Tuệ &amp; Bản Quyền Tác Phẩm
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bảo hộ bản quyền hình ảnh, video clip, poster thiết kế và bài viết sáng tác
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Quyền tác giả cá nhân:</strong> Mọi bức ảnh chụp, footage video raw và poster do thành viên tải lên hoặc sáng tạo trên nền tảng thuộc quyền sở hữu trí tuệ của chính tác giả đó và CLB Nhiếp Ảnh LTD.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Gắn Watermark bảo vệ:</strong> Hệ thống cung cấp công cụ tự động chèn Watermark bản quyền (<em>"Photo by [Tên] • LTD Photo Club"</em>). Thành viên được khuyến nghị luôn sử dụng watermark khi xuất bản ấn phẩm ra ngoài để phòng ngừa tình trạng đánh cắp tác phẩm.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Nghiêm cấm thương mại hóa trái phép:</strong> Không một cá nhân hay tổ chức nào được phép trích xuất kho ảnh, video recap hoặc bài đăng của CLB LTD để kinh doanh hay phân phối lại mà không có sự đồng ý bằng văn bản của Ban Quản Trị CLB.
              </p>
            </div>
          </div>
        </section>

        {/* ĐIỀU 2: BẢO MẬT TÀI KHOẢN VÀ THÔNG TIN CÁ NHÂN */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                2. Bảo Mật Tài Khoản Thành Viên &amp; Dữ Liệu Cá Nhân
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bảo vệ thông tin đăng nhập, phân quyền 2 Ban chuyên môn và dữ liệu liên lạc
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p>
                <strong>Xác thực Firebase Auth an toàn:</strong> Toàn bộ mật khẩu người dùng được băm (hash) và quản lý bảo mật trực tiếp trên máy chủ đám mây của Google Firebase, đội ngũ phát triển không thể đọc mật khẩu dạng thô.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p>
                <strong>Trách nhiệm bảo mật tài khoản:</strong> Mỗi thành viên có nghĩa vụ tự bảo vệ thông tin đăng nhập của mình, không chia sẻ cho người ngoài CLB để tránh làm rò rỉ kế hoạch truyền thông nội bộ.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p>
                <strong>Cam kết không chia sẻ bên thứ ba:</strong> Số điện thoại, họ tên và vai trò thành viên chỉ phục vụ cho việc vận hành hoạt động của <strong>Ban Truyền thông</strong> và <strong>Ban Kỹ thuật</strong>, tuyệt đối không chia sẻ cho mục đích quảng cáo bên ngoài.
              </p>
            </div>
          </div>
        </section>

        {/* ĐIỀU 3: BẢO VỆ API KEY & TÀI NGUYÊN HỆ THỐNG */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                3. Quy Định Sử Dụng Trợ Lý AI &amp; Tài Nguyên Hệ Thống
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sử dụng có trách nhiệm, trung thực dữ liệu và bảo mật hạ tầng Gemini AI
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <p>
                <strong>Chính sách không bịa đặt số liệu (No Hallucination):</strong> Thành viên sử dụng AI Content Writer và AI Creative Director phải kiểm chứng các thông tin thực tế (thời gian, địa điểm workshop, thông số thiết bị máy ảnh) trước khi chính thức phát hành lên mạng xã hội.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <p>
                <strong>Bảo mật Gemini AI Key:</strong> Khóa API Google Gemini được lưu trữ an toàn trong biến môi trường máy chủ hoặc trên trình duyệt cá nhân đã mã hóa, nghiêm cấm các hành vi inject mã độc hoặc phá hoại hạn mức gọi AI của CLB.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
              <p>
                <strong>Kiểm duyệt nội dung:</strong> Không sử dụng nền tảng để tạo các nội dung vi phạm thuần phong mỹ tục, xuyên tạc thông tin hoặc vi phạm luật An ninh mạng Việt Nam.
              </p>
            </div>
          </div>
        </section>

        {/* LIÊN HỆ BAN QUẢN TRỊ */}
        <div className="p-6 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-blue-900 dark:text-cyan-300 uppercase tracking-wide">
              Ban Quản Trị CLB Nhiếp Ảnh Long Thành Digital (LTD)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Chủ tịch CLB: Đỗ Quốc Thảo • Hotline/Zalo: 0785 242 404 • Email: dothao783@gmail.com
            </p>
          </div>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition self-start sm:self-auto"
          >
            Đăng Nhập Quản Trị
          </Link>
        </div>
      </div>
    </div>
  );
}
