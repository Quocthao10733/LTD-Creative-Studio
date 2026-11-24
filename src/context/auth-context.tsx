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
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const p = await fetchUserProfile(currentUser.uid);
        if (p) {
          setProfile(p);
        } else {
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || "",
            displayName: currentUser.displayName || "Thành viên LTD",
            photoURL: currentUser.photoURL || undefined,
            department: "Ban Truyền thông",
            role: "Thành viên",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
