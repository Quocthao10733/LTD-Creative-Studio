export type DepartmentCode = "COMM" | "TECH";

export interface DepartmentInfo {
  code: DepartmentCode;
  name: string;
  shortName: string;
  description: string;
  memberCount: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}

export const DEPARTMENTS: Record<DepartmentCode, DepartmentInfo> = {
  COMM: {
    code: "COMM",
    name: "Ban Truyền thông",
    shortName: "Truyền thông",
    description: "Sáng tạo nội dung truyền thông số, quản trị fanpage Facebook, TikTok, Instagram và lan tỏa hình ảnh CLB.",
    memberCount: 13,
    color: "#2563eb",
    badgeBg: "bg-blue-50 border-blue-200 text-blue-700",
    badgeText: "text-blue-600",
    iconName: "Megaphone",
  },
  TECH: {
    code: "TECH",
    name: "Ban Kỹ thuật",
    shortName: "Kỹ thuật",
    description: "Nhiếp ảnh chuyên nghiệp, quay phim, quản lý thiết bị máy ảnh/ống kính và hậu kỳ video, chỉnh màu.",
    memberCount: 16,
    color: "#8b5cf6",
    badgeBg: "bg-purple-50 border-purple-200 text-purple-700",
    badgeText: "text-purple-600",
    iconName: "Code",
  },
};

export interface Member {
  id: string;
  name: string;
  department: DepartmentCode;
  role: string;
  generation: string;
  bio: string;
  equipment?: string;
  skills?: string[];
  avatar?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive" | "alumni";
  joinedDate: string;
  createdAt: string;
}
