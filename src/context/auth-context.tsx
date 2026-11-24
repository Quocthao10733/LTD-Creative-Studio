"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  getFirebaseAuth,
  UserProfile,
  loginWithFirebase,
  registerWithFirebase,
  loginWithGoogleFirebase,
  logoutFirebase,
  fetchUserProfile,
  saveUserProfileToCloud,
} from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (params: {
    email: string;
    password: string;
    displayName: string;
    department: "Ban Truyền thông" | "Ban Kỹ thuật";
    role?: "Chủ tịch CLB" | "Trưởng Ban" | "Phó Ban" | "Thành viên";
    phone?: string;
  }) => Promise<void>;
  loginWithGoogle: (dept?: "Ban Truyền thông" | "Ban Kỹ thuật") => Promise<void>;
  logout: () => Promise<void>;
  setLocalProfile: (profile: UserProfile) => void;
  updateUserProfile: (profile: UserProfile) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Placeholder uid — dùng để phân biệt "chưa đăng nhập" với user thật
export const DEFAULT_LTD_PROFILE: UserProfile = {
  uid: "ltd-default-admin",
  email: "",
  displayName: "",
  department: "Ban Truyền thông",
  role: "Thành viên",
  photoURL: undefined,
  createdAt: "",
  updatedAt: "",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Khởi tạo null — không fallback về demo data cũ
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("LTD_CURRENT_USER");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Chỉ dùng nếu là user thật (có displayName, không phải demo admin cũ)
          if (parsed?.uid && parsed.uid !== "ltd-default-admin" && parsed.displayName) {
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timer: đảm bảo loading không bao giờ bị đơ quá 1 giây
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      clearTimeout(timer);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Cập nhật profile tạm từ Firebase Auth tức thì để không bị đứng trang
        const basicProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || "",
          displayName: currentUser.displayName || "Thành viên LTD",
          photoURL: currentUser.photoURL || undefined,
          department: "Ban Truyền thông",
          role: "Thành viên",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setProfile((prev) => prev || basicProfile);

        // Tải chi tiết ngầm từ Cloud không làm treo ứng dụng
        fetchUserProfile(currentUser.uid)
          .then((p) => {
            if (p) setProfile(p);
          })
          .catch(() => {});
      }
      setLoading(false);
      clearTimeout(timer);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await loginWithFirebase(email, pass);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setLoading(false);
    }
  };

  const register = async (params: {
    email: string;
    password: string;
    displayName: string;
    department: "Ban Truyền thông" | "Ban Kỹ thuật";
    role?: "Chủ tịch CLB" | "Trưởng Ban" | "Phó Ban" | "Thành viên";
    phone?: string;
  }) => {
    setLoading(true);
    try {
      const res = await registerWithFirebase(params);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (dept?: "Ban Truyền thông" | "Ban Kỹ thuật") => {
    setLoading(true);
    try {
      const res = await loginWithGoogleFirebase(dept);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutFirebase();
    setUser(null);
    setProfile(null);
    // Xóa cache local khi đăng xuất
    if (typeof window !== "undefined") {
      localStorage.removeItem("LTD_CURRENT_USER");
    }
  };

  const setLocalProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem("LTD_CURRENT_USER", JSON.stringify(newProfile));
    }
  };

  const updateUserProfile = async (newProfile: UserProfile): Promise<boolean> => {
    setProfile(newProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem("LTD_CURRENT_USER", JSON.stringify(newProfile));
      localStorage.setItem(`LTD_USER_PROFILE_${newProfile.uid}`, JSON.stringify(newProfile));
    }
    return await saveUserProfileToCloud(newProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        setLocalProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng trong AuthProvider");
  }
  return context;
}
