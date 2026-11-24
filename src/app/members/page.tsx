"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  X,
  Check,
  ShieldCheck,
  Camera,
  Megaphone,
  Code,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  HeartHandshake,
  Mail,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  UploadCloud,
  RefreshCw,
} from "lucide-react";
import { Member, DepartmentCode, DEPARTMENTS } from "@/lib/types/member";
import { MemberPhotoCropperModal } from "@/components/members/member-photo-cropper-modal";

function MembersContent() {
  const searchParams = useSearchParams();
  const initialDept = searchParams.get("dept") || "all";
  const initialQ = searchParams.get("q") || "";

  const [members, setMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<string>(initialDept);
  const [searchQuery, setSearchQuery] = React.useState(initialQ);

  // Selected member for detail drawer/modal
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);

  // Dedicated Cropper Modal for individual member
  const [croppingMember, setCroppingMember] = React.useState<Member | null>(null);

  // Form Fields
  const [formName, setFormName] = React.useState("");
  const [formDept, setFormDept] = React.useState<DepartmentCode>("COMM");
  const [formRole, setFormRole] = React.useState("Thành viên");
  const [formGen, setFormGen] = React.useState("Gen 2026");
  const [formJoinedDate, setFormJoinedDate] = React.useState("11/2026");
  const [formBio, setFormBio] = React.useState("");
  const [formEquipment, setFormEquipment] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formSkillInput, setFormSkillInput] = React.useState("");
  const [formSkills, setFormSkills] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  // CSV Import State
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sync query params if updated
  React.useEffect(() => {
    const d = searchParams.get("dept");
    if (d) setActiveTab(d);
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Fetch Members from API
  const fetchMembers = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/members");
      const json = await res.json();
      if (json.success) {
        setMembers(json.data);
      }
    } catch (err) {
      console.error("Lỗi tải danh bạ thành viên:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Filtered members list
  const filteredMembers = React.useMemo(() => {
    return members.filter((m) => {
      const matchDept = activeTab === "all" || m.department === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.bio.toLowerCase().includes(q) ||
        (m.equipment && m.equipment.toLowerCase().includes(q)) ||
        (m.skills && m.skills.some((s) => s.toLowerCase().includes(q)));
      return matchDept && matchSearch;
    });
  }, [members, activeTab, searchQuery]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormName("");
    setFormDept("COMM");
    setFormRole("Thành viên");
    setFormGen("Gen 2026");
    setFormJoinedDate("11/2026");
    setFormBio("");
    setFormEquipment("");
    setFormEmail("");
    setFormSkills([]);
    setFormSkillInput("");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormName(m.name);
    setFormDept(m.department);
    setFormRole(m.role);
    setFormGen(m.generation);
    setFormJoinedDate(m.joinedDate || "11/2026");
    setFormBio(m.bio);
    setFormEquipment(m.equipment || "");
    setFormEmail(m.email || "");
    setFormSkills(m.skills || []);
    setFormSkillInput("");
    setIsModalOpen(true);
  };

  const handleAddSkill = () => {
    if (formSkillInput.trim() && !formSkills.includes(formSkillInput.trim())) {
      setFormSkills([...formSkills, formSkillInput.trim()]);
      setFormSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormSkills(formSkills.filter((s) => s !== skill));
  };

  // Handle Submit (Create or Update)
  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setMessage({ text: "Vui lòng nhập họ tên thành viên!", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      if (editingMember) {
        // UPDATE
        const res = await fetch("/api/members", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingMember.id,
            name: formName.trim(),
            department: formDept,
            role: formRole.trim(),
            generation: formGen.trim(),
            joinedDate: formJoinedDate.trim() || "11/2026",
            bio: formBio.trim(),
            equipment: formEquipment.trim(),
            email: formEmail.trim(),
            skills: formSkills,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setMessage({ text: "Cập nhật thành công!", type: "success" });
          fetchMembers();
          if (selectedMember && selectedMember.id === editingMember.id) {
            setSelectedMember(json.data);
          }
          setTimeout(() => setIsModalOpen(false), 1000);
        } else {
          setMessage({ text: json.error || "Lỗi cập nhật", type: "error" });
        }
      } else {
        // CREATE
        const res = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            department: formDept,
            role: formRole.trim(),
            generation: formGen.trim(),
            joinedDate: formJoinedDate.trim() || "11/2026",
            bio: formBio.trim(),
            equipment: formEquipment.trim(),
            email: formEmail.trim(),
            skills: formSkills,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setMessage({ text: "Thêm thành viên thành công!", type: "success" });
          fetchMembers();
          setTimeout(() => setIsModalOpen(false), 1000);
        } else {
          setMessage({ text: json.error || "Lỗi tạo thành viên", type: "error" });
        }
      }
    } catch (err: any) {
      setMessage({ text: "Lỗi kết nối máy chủ", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}" khỏi danh bạ LTD?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/members?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        if (selectedMember && selectedMember.id === id) {
          setSelectedMember(null);
        }
      }
    } catch (err) {
      alert("Lỗi khi xóa thành viên!");
    }
  };

  // Callback when a member's photo crop is saved successfully
  const handleCropSuccess = (updatedMember: Member) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
    if (selectedMember && selectedMember.id === updatedMember.id) {
      setSelectedMember(updatedMember);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Họ Tên", "Ban", "Chức Vụ", "Khóa/Gen", "Thiết Bị", "Kỹ Năng", "Email", "Ngày Tham Gia"];
    const rows = filteredMembers.map((m) => [
      m.id,
      `"${m.name}"`,
      `"${DEPARTMENTS[m.department]?.name || m.department}"`,
      `"${m.role}"`,
      `"${m.generation}"`,
      `"${m.equipment || ""}"`,
      `"${(m.skills || []).join(", ")}"`,
      `"${m.email || ""}"`,
      `"${m.joinedDate}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `LTD_Members_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import handler
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const newMembers: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.replace(/^"|"$/g, "").trim());
        if (parts[1]) {
          newMembers.push({
            name: parts[1],
            department: parts[2]?.includes("Kỹ thuật") ? "TECH" : "COMM",
            role: parts[3] || "Thành viên",
            generation: parts[4] || "Gen 2026",
            equipment: parts[5] || "",
            skills: parts[6] ? parts[6].split(";").map((s) => s.trim()) : [],
            email: parts[7] || "",
          });
        }
      }

      if (newMembers.length > 0) {
        try {
          const res = await fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newMembers),
          });
          const json = await res.json();
          if (json.success) {
            alert(`Đã import thành công ${newMembers.length} thành viên!`);
            fetchMembers();
          }
        } catch {
          alert("Lỗi khi import file CSV!");
        }
      }
    };
    reader.readAsText(file);
  };

  const getDeptIcon = (code: DepartmentCode) => {
    switch (code) {
      case "COMM":
        return <Megaphone className="w-3.5 h-3.5" />;
      case "TECH":
        return <Code className="w-3.5 h-3.5" />;
      default:
        return <Users className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>DANH BẠ THÀNH VIÊN — CLB NHIẾP ẢNH LTD</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Cơ Cấu 2 Ban Chuyên Môn (Ban Truyền thông &amp; Ban Kỹ thuật)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý danh sách thành viên chính thức, phân ban, vai trò, thiết bị máy ảnh và kỹ năng chuyên môn.
          </p>
        </div>

        {/* Admin Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            title="Import danh sách từ file CSV"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            title="Xuất file CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Danh Sách</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Thành Viên</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
        {/* Department Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất Cả ({members.length})
          </button>

          {Object.values(DEPARTMENTS).map((d) => {
            const count = members.filter((m) => m.department === d.code).length;
            const isActive = activeTab === d.code;

            return (
              <button
                key={d.code}
                onClick={() => setActiveTab(d.code)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {getDeptIcon(d.code)}
                <span>{d.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Result Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo họ tên, chức vụ, máy ảnh (Sony, Canon...) hoặc kỹ năng..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Hiển thị <strong>{filteredMembers.length}</strong> / {members.length} thành viên
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Đang tải danh sách thành viên LTD...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">
            Không tìm thấy thành viên nào
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Không có thành viên nào khớp với bộ lọc hoặc từ khóa tìm kiếm &quot;{searchQuery}&quot;.
          </p>
          <button
            onClick={() => {
              setActiveTab("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ember-stagger-1">
          {filteredMembers.map((member) => {
            const deptInfo = DEPARTMENTS[member.department] || DEPARTMENTS.COMM;

            return (
              <div
                key={member.id}
                className="embers-card group relative rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between"
              >
                {/* Member Card Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    {/* Member Avatar with Direct Click & Camera Badge */}
                    <div
                      onClick={() => setCroppingMember(member)}
                      className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group/cardAvatar hover:ring-2 hover:ring-blue-500 transition-all shadow-sm"
                      title={`Nhấp để căn chỉnh ảnh thẻ cho ${member.name}`}
                    >
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover/cardAvatar:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-base">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      {/* Small Camera Badge in corner */}
                      <div className="absolute bottom-0 right-0 p-1 bg-slate-900/80 rounded-tl-lg text-white group-hover/cardAvatar:bg-blue-600 transition-colors">
                        <Camera className="w-2.5 h-2.5 text-white" />
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-[1px] opacity-0 group-hover/cardAvatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <Camera className="w-4 h-4 text-white" />
                        <span className="text-[9px] font-bold mt-0.5">Căn ảnh</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Direct Edit Photo Button on Each Box */}
                      <button
                        onClick={() => setCroppingMember(member)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        title={`Căn chỉnh ảnh thẻ cho ${member.name}`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                          title="Xóa thành viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div>
                    <h4
                      onClick={() => setSelectedMember(member)}
                      className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
                      title="Nhấn để xem chi tiết hồ sơ"
                    >
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

                  {/* Bio */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Equipment Tag if present */}
                  {member.equipment && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                      <Camera className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{member.equipment}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Detail View Action */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Gia nhập: {member.joinedDate}
                  </span>
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Xem hồ sơ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MEMBER DETAIL MODAL / DRAWER (Matching Hình 2) ================= */}
      {selectedMember && (
        <div
          onClick={() => setSelectedMember(null)}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md sm:max-w-lg rounded-[32px] bg-white dark:bg-[#0c1420] border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
          >
            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1">
              {/* Top Hero Portrait Section (Inspired by Hình 2) */}
              <div className="relative w-full h-80 sm:h-96 bg-slate-950 select-none overflow-hidden group/hero">
                {selectedMember.avatar ? (
                  <img
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/hero:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-cyan-500/20 mb-3">
                      {selectedMember.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-400">Chưa tải ảnh thẻ đại diện</span>
                  </div>
                )}

                {/* Gradient Overlays for Cinematic Polish */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-950/60 to-transparent pointer-events-none" />

                {/* Floating Top Buttons */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                  <button
                    onClick={() => setCroppingMember(selectedMember)}
                    className="px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-md text-white border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    title="Căn chỉnh bố cục ảnh đại diện của thành viên này"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Căn chỉnh ảnh</span>
                  </button>

                  <button
                    onClick={() => setSelectedMember(null)}
                    className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-md text-white border border-white/15 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                    title="Đóng hồ sơ"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Overlaid Identity Info at Bottom of Photo (Matching Hình 2) */}
                <div className="absolute bottom-4 inset-x-5 z-10 text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
                      {selectedMember.name}
                    </h3>
                    <span title="Thành viên chính thức CLB Nhiếp Ảnh LTD">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20 shrink-0 drop-shadow" />
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-cyan-300 drop-shadow">
                    {selectedMember.role}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-sm font-semibold">
                      {DEPARTMENTS[selectedMember.department]?.name}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-sm font-semibold text-amber-300">
                      {selectedMember.generation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Body */}
              <div className="p-6 space-y-5">
                {/* Quick Stat Chips (Like bottom row in Hình 2) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Thời Gian Tham Gia
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                      {selectedMember.joinedDate || "11/2026"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Thế Hệ (Gen)
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {selectedMember.generation}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Email Liên Hệ
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 truncate" title={selectedMember.email || "Nội bộ LTD"}>
                      <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{selectedMember.email || "Nội bộ LTD"}</span>
                    </span>
                  </div>
                </div>

                {/* Giới thiệu & Đóng góp */}
                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-blue-500" />
                    <span>Giới Thiệu &amp; Đóng Góp Cho CLB</span>
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 font-normal">
                    {selectedMember.bio}
                  </p>
                </div>

                {/* Thiết Bị Máy Ảnh & Ống Kính */}
                {selectedMember.equipment && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Thiết Bị Máy Ảnh &amp; Ống Kính Đang Dùng</span>
                    </h5>
                    <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <Camera className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span>{selectedMember.equipment}</span>
                    </div>
                  </div>
                )}

                {/* Kỹ Năng Chuyên Môn */}
                {selectedMember.skills && selectedMember.skills.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Kỹ Năng Chuyên Môn &amp; Thế Mạnh
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions (Like Follow + button in Hình 2) */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2.5">
              <button
                onClick={() => setCroppingMember(selectedMember)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-500" />
                <span>Căn Chỉnh Ảnh</span>
              </button>

              <button
                onClick={() => {
                  handleOpenEdit(selectedMember);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Chỉnh Sửa Hồ Sơ</span>
              </button>

              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT MEMBER MODAL ================= */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingMember ? "Chỉnh Sửa Thông Tin Thành Viên" : "Thêm Thành Viên Mới Vào CLB"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitMember} className="space-y-4">
              {/* Họ tên */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Họ và tên thành viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Ban & Chức vụ */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">
                    Ban chuyên môn
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value as DepartmentCode)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {Object.values(DEPARTMENTS).map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">
                    Chức vụ / Vai trò
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="Trưởng ban / Thành viên / CTV"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Thế hệ (Gen) & Ngày gia nhập CLB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Thế hệ (Gen) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Thế hệ (Gen)
                    </label>
                    <span className="text-[10px] text-blue-500 font-medium">Tự do điền số</span>
                  </div>
                  <input
                    type="text"
                    list="gen-options"
                    value={formGen}
                    onChange={(e) => setFormGen(e.target.value)}
                    placeholder="VD: Gen 1, Gen 4, 4, Gen 2026..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <datalist id="gen-options">
                    <option value="Gen 1" />
                    <option value="Gen 2" />
                    <option value="Gen 3" />
                    <option value="Gen 4" />
                    <option value="Gen 5" />
                    <option value="Gen 2026" />
                  </datalist>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {["Gen 1", "Gen 2", "Gen 3", "Gen 4", "Gen 2026"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormGen(g)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                          formGen === g
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thời gian tham gia CLB */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">
                      Thời gian gia nhập
                    </label>
                    <span className="text-[10px] text-slate-400 font-normal">Tháng / Năm</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formJoinedDate}
                      onChange={(e) => setFormJoinedDate(e.target.value)}
                      placeholder="VD: 11/2026 hoặc 15/11/2026"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {["11/2026", "10/2023", "03/2024", "09/2024"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormJoinedDate(d)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                          formJoinedDate === d
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Email liên hệ */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Email liên hệ
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@ltdclub.vn hoặc để trống nếu dùng nội bộ"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Thiết bị máy ảnh */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Thiết bị máy ảnh / Ống kính đang dùng
                </label>
                <input
                  type="text"
                  value={formEquipment}
                  onChange={(e) => setFormEquipment(e.target.value)}
                  placeholder="Ví dụ: Sony A7 IV + Lens 24-70mm f/2.8 GM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Giới thiệu / Bio */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Giới thiệu vai trò &amp; thế mạnh
                </label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Mô tả công việc phụ trách và thế mạnh nhiếp ảnh/truyền thông..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Kỹ năng tags */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Kỹ năng chuyên môn
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formSkillInput}
                    onChange={(e) => setFormSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    placeholder="Nhập kỹ năng rồi bấm Thêm"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : editingMember ? "Cập Nhật" : "Lưu Thành Viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DEDICATED MEMBER PHOTO CROPPER MODAL ================= */}
      {croppingMember && (
        <MemberPhotoCropperModal
          member={croppingMember}
          isOpen={!!croppingMember}
          onClose={() => setCroppingMember(null)}
          onSaveSuccess={handleCropSuccess}
        />
      )}
    </div>
  );
}

export default function MembersPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Đang tải danh bạ thành viên LTD...</p>
        </div>
      }
    >
      <MembersContent />
    </React.Suspense>
  );
}
