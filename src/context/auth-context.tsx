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

// Profile mặc định cho Ban Điều Hành CLB LTD nếu chưa đăng nhập
export const DEFAULT_LTD_PROFILE: UserProfile = {
  uid: "ltd-default-admin",
  email: "admin@ltdphoto.club",
  displayName: "Đỗ Quốc Thảo",
  department: "Ban Truyền thông",
  role: "Chủ tịch CLB",
  photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-11-24T00:00:00.000Z",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("LTD_CURRENT_USER");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_LTD_PROFILE;
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
    setProfile(DEFAULT_LTD_PROFILE);
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
