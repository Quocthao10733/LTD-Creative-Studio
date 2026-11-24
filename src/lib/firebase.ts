import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  child,
  remove,
  Database,
} from "firebase/database";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  Firestore,
} from "firebase/firestore";
import { CalendarEvent } from "@/lib/types/director";

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

const STORAGE_KEY = "LTD_FIREBASE_CONFIG";

// Cấu hình chính thức của dự án LTD Creative Studio do người dùng cung cấp
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyCE-P5tk7tfDOfPuxSghPLFQ9JGR0iRCbk",
  authDomain: "ltd-creative-studio.firebaseapp.com",
  projectId: "ltd-creative-studio",
  storageBucket: "ltd-creative-studio.firebasestorage.app",
  messagingSenderId: "137784324448",
  appId: "1:137784324448:web:cd0b9921d4f146a6e96e05",
  measurementId: "G-68DGWCNCS7",
  databaseURL: "https://ltd-creative-studio-default-rtdb.firebaseio.com",
};

// Lấy cấu hình từ biến môi trường, localStorage hoặc mặc định
export function getFirebaseConfig(): FirebaseConfig {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.projectId || parsed.apiKey) {
          return { ...DEFAULT_FIREBASE_CONFIG, ...parsed };
        }
      }
    } catch {}
  }

  const envConfig: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || DEFAULT_FIREBASE_CONFIG.databaseURL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
  };

  return envConfig;
}

export function saveFirebaseConfig(config: FirebaseConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
}

let cachedApp: FirebaseApp | null = null;
let cachedRtdb: Database | null = null;
let cachedFirestore: Firestore | null = null;
let cachedAuth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (getApps().length > 0) {
      return getApp();
    }
    cachedApp = initializeApp(config as Record<string, string>);
    return cachedApp;
  } catch (err) {
    console.error("Firebase initializeApp error:", err);
    return null;
  }
}

export function getFirebaseDatabase(): Database | null {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    if (!cachedRtdb) {
      cachedRtdb = getDatabase(app);
    }
    return cachedRtdb;
  } catch (err) {
    return null;
  }
}

export function getFirebaseFirestore(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    if (!cachedFirestore) {
      cachedFirestore = getFirestore(app);
    }
    return cachedFirestore;
  } catch (err) {
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    if (!cachedAuth) {
      cachedAuth = getAuth(app);
    }
    return cachedAuth;
  } catch (err) {
    return null;
  }
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  department: "Ban Truyền thông" | "Ban Kỹ thuật";
  role: "Chủ tịch CLB" | "Trưởng Ban" | "Phó Ban" | "Thành viên";
  phone?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Đăng ký tài khoản thành viên mới trên Firebase Authentication & Realtime Cloud
 */
export async function registerWithFirebase(params: {
  email: string;
  password: string;
  displayName: string;
  department: "Ban Truyền thông" | "Ban Kỹ thuật";
  role?: "Chủ tịch CLB" | "Trưởng Ban" | "Phó Ban" | "Thành viên";
  phone?: string;
}): Promise<{ user: User; profile: UserProfile }> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth chưa được khởi tạo!");

  const cred = await createUserWithEmailAndPassword(auth, params.email, params.password);
  const user = cred.user;

  // Tạo avatar đại diện cá nhân hóa theo tên thành viên
  const initialPhoto = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    params.displayName
  )}&backgroundColor=0ea5e9,6366f1,2563eb`;

  // Cập nhật displayName và photoURL trên Firebase Auth
  try {
    await updateProfile(user, {
      displayName: params.displayName,
      photoURL: initialPhoto,
    });
  } catch (err) {
    console.warn("Cập nhật Auth profile thất bại:", err);
  }

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || params.email,
    displayName: params.displayName,
    photoURL: initialPhoto,
    department: params.department,
    role: params.role || "Thành viên",
    phone: params.phone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Đồng bộ lên Firebase Realtime Database (đồng bộ tức thì giữa PC và Điện thoại)
  const rtdb = getFirebaseDatabase();
  if (rtdb) {
    try {
      await set(ref(rtdb, `users/${user.uid}`), profile);
    } catch (rtdbErr) {
      console.warn("Lưu profile RTDB lỗi:", rtdbErr);
    }
  }

  // Đồng bộ thêm vào Firestore collection 'users'
  const firestore = getFirebaseFirestore();
  if (firestore) {
    try {
      const userRef = doc(firestore, "users", user.uid);
      await setDoc(userRef, profile, { merge: true });
    } catch (fsErr) {
      console.warn("Lưu profile Firestore lỗi:", fsErr);
    }
  }

  // Lưu vào localStorage để fallback offline
  if (typeof window !== "undefined") {
    localStorage.setItem(`LTD_USER_PROFILE_${user.uid}`, JSON.stringify(profile));
    localStorage.setItem("LTD_CURRENT_USER", JSON.stringify(profile));
  }

  return { user, profile };
}

/**
 * Đăng nhập tài khoản bằng Email & Mật khẩu
 */
export async function loginWithFirebase(
  email: string,
  password: string
): Promise<{ user: User; profile: UserProfile }> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth chưa được khởi tạo!");

  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  // Tải profile từ Firestore hoặc localStorage
  let profile = await fetchUserProfile(user.uid);
  if (!profile) {
    profile = {
      uid: user.uid,
      email: user.email || email,
      displayName: user.displayName || email.split("@")[0],
      photoURL: user.photoURL || undefined,
      department: "Ban Truyền thông",
      role: "Thành viên",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("LTD_CURRENT_USER", JSON.stringify(profile));
  }

  return { user, profile };
}

/**
 * Đăng nhập nhanh bằng tài khoản Google
 */
export async function loginWithGoogleFirebase(
  department: "Ban Truyền thông" | "Ban Kỹ thuật" = "Ban Truyền thông"
): Promise<{ user: User; profile: UserProfile }> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth chưa được khởi tạo!");

  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const user = cred.user;

  let profile = await fetchUserProfile(user.uid);
  if (!profile) {
    profile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "Thành viên LTD",
      photoURL: user.photoURL || undefined,
      department,
      role: "Thành viên",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const firestore = getFirebaseFirestore();
    if (firestore) {
      try {
        await setDoc(doc(firestore, "users", user.uid), profile);
      } catch {}
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("LTD_CURRENT_USER", JSON.stringify(profile));
  }

  return { user, profile };
}

/**
 * Đăng xuất khỏi Firebase
 */
export async function logoutFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("LTD_CURRENT_USER");
  }
}

/**
 * Lưu hồ sơ người dùng lên Cloud (Firebase Auth + Realtime Database + Firestore)
 * Đảm bảo đồng bộ 100% giữa Máy tính và Điện thoại
 */
export async function saveUserProfileToCloud(profile: UserProfile): Promise<boolean> {
  let success = false;
  const auth = getFirebaseAuth();

  // 1. Cập nhật Firebase Auth profile của user hiện tại
  if (auth && auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
      });
      success = true;
    } catch (e) {
      console.warn("Lỗi cập nhật Firebase Auth profile:", e);
    }
  }

  // 2. Lưu vào Firebase Realtime Database (đồng bộ tức thì mọi thiết bị)
  const rtdb = getFirebaseDatabase();
  if (rtdb && profile.uid) {
    try {
      await set(ref(rtdb, `users/${profile.uid}`), profile);
      success = true;
    } catch (e) {
      console.warn("Lỗi lưu profile lên Realtime Database:", e);
    }
  }

  // 3. Lưu vào Firestore
  const firestore = getFirebaseFirestore();
  if (firestore && profile.uid) {
    try {
      await setDoc(doc(firestore, "users", profile.uid), profile, { merge: true });
      success = true;
    } catch (e) {
      console.warn("Lỗi lưu profile lên Firestore:", e);
    }
  }

  // 4. Lưu offline localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(`LTD_USER_PROFILE_${profile.uid}`, JSON.stringify(profile));
    localStorage.setItem("LTD_CURRENT_USER", JSON.stringify(profile));
  }

  return success;
}

const withTimeout = <T>(promise: Promise<T>, ms = 1500): Promise<T | null> => {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
};

/**
 * Lấy thông tin User Profile từ Realtime Database, Firestore hoặc Auth
 * Đảm bảo dữ liệu máy tính & điện thoại luôn đồng nhất (có timeout an toàn không bị đứng)
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  // 1. Thử lấy từ Firebase Realtime Database trước (timeout 1.5s để không bao giờ bị đơ giao diện)
  const rtdb = getFirebaseDatabase();
  if (rtdb) {
    try {
      const snap = await withTimeout(get(child(ref(rtdb), `users/${uid}`)), 1500);
      if (snap && snap.exists()) {
        const data = snap.val() as UserProfile;
        if (typeof window !== "undefined") {
          localStorage.setItem(`LTD_USER_PROFILE_${uid}`, JSON.stringify(data));
          localStorage.setItem("LTD_CURRENT_USER", JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn("Không thể tải profile từ RTDB:", e);
    }
  }

  // 2. Thử lấy từ Firestore (timeout 1.5s)
  const firestore = getFirebaseFirestore();
  if (firestore) {
    try {
      const snap = await withTimeout(getDoc(doc(firestore, "users", uid)), 1500);
      if (snap && snap.exists()) {
        const data = snap.data() as UserProfile;
        if (typeof window !== "undefined") {
          localStorage.setItem(`LTD_USER_PROFILE_${uid}`, JSON.stringify(data));
          localStorage.setItem("LTD_CURRENT_USER", JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn("Không thể tải profile từ Firestore:", e);
    }
  }

  // 3. Đọc từ Firebase Auth User hiện tại (nếu đang đăng nhập)
  const auth = getFirebaseAuth();
  if (auth && auth.currentUser && auth.currentUser.uid === uid) {
    const cu = auth.currentUser;
    const authProfile: UserProfile = {
      uid: cu.uid,
      email: cu.email || "",
      displayName: cu.displayName || cu.email?.split("@")[0] || "Thành viên LTD",
      photoURL: cu.photoURL || undefined,
      department: "Ban Truyền thông",
      role: "Thành viên",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return authProfile;
  }

  // 4. Fallback localStorage
  if (typeof window !== "undefined") {
    try {
      const local =
        localStorage.getItem(`LTD_USER_PROFILE_${uid}`) ||
        localStorage.getItem("LTD_CURRENT_USER");
      if (local) return JSON.parse(local);
    } catch {}
  }

  return null;
}

export function getFirebaseStatus(): {
  isConfigured: boolean;
  projectId?: string;
  databaseURL?: string;
} {
  const config = getFirebaseConfig();
  return {
    isConfigured: Boolean(config.apiKey && config.projectId),
    projectId: config.projectId,
    databaseURL: config.databaseURL,
  };
}

/**
 * Lắng nghe sự kiện lịch thời gian thực (Realtime Listener)
 * Ưu tiên Firebase Realtime Database / Firestore, tự động fallback nếu chưa mở Rules
 */
export function subscribeRealtimeCalendar(
  onEvents: (events: CalendarEvent[]) => void,
  onError?: (err: any) => void
): () => void {
  // 1. Tải dữ liệu ban đầu từ local REST API ngay lập tức
  fetchFallback(onEvents);

  const rtdb = getFirebaseDatabase();
  const firestore = getFirebaseFirestore();

  let unsubs: (() => void)[] = [];

  // 2. Thử lắng nghe qua Firebase Realtime Database
  if (rtdb) {
    try {
      const eventsRef = ref(rtdb, "calendar_events");
      const unsubscribeRtdb = onValue(
        eventsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const list: CalendarEvent[] = Array.isArray(val)
              ? val.filter(Boolean)
              : Object.values(val);
            onEvents(list);
          }
        },
        (error) => {
          // Báo lỗi 1 lần nếu RTDB permission bị từ chối
          console.warn("RTDB sync inactive:", error.message);
          if (onError) onError(error);
        }
      );
      unsubs.push(() => {
        try {
          unsubscribeRtdb();
        } catch {}
      });
    } catch (err) {
      console.warn("RTDB init listener error:", err);
    }
  }

  // 3. Polling nhẹ định kỳ mỗi 30 giây để cập nhật dữ liệu nếu không có Firebase Realtime
  const interval = setInterval(() => {
    fetchFallback(onEvents);
  }, 30000);

  unsubs.push(() => clearInterval(interval));

  return () => {
    unsubs.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  };
}

function tryFirestoreListener(
  firestore: Firestore,
  onEvents: (events: CalendarEvent[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(firestore, "calendar_events");
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as CalendarEvent);
          onEvents(list);
        } else {
          fetchFallback(onEvents);
        }
      },
      (err) => {
        console.warn("Firestore listener error, using Local Realtime:", err.message);
        if (onError) onError(err);
        fetchFallback(onEvents);
      }
    );
    return unsubscribe;
  } catch {
    fetchFallback(onEvents);
  }
}

async function fetchFallback(onEvents: (events: CalendarEvent[]) => void) {
  try {
    const res = await fetch("/api/calendar");
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      onEvents(json.data);
    }
  } catch (err) {
    console.error("Lỗi fetch /api/calendar:", err);
  }
}

async function fetchFallbackAndSyncToFirebase(
  rtdb: Database,
  onEvents: (events: CalendarEvent[]) => void
) {
  try {
    const res = await fetch("/api/calendar");
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      onEvents(json.data);
      const eventsRef = ref(rtdb, "calendar_events");
      const map: Record<string, CalendarEvent> = {};
      json.data.forEach((evt: CalendarEvent) => {
        map[evt.id] = evt;
      });
      set(eventsRef, map).catch(() => {});
    }
  } catch {}
}

/**
 * Lưu sự kiện lịch lên Firebase & API nội bộ
 */
export async function saveRealtimeCalendarEvent(event: CalendarEvent): Promise<boolean> {
  const rtdb = getFirebaseDatabase();
  const firestore = getFirebaseFirestore();

  // 1. Ghi lên Realtime Database
  if (rtdb) {
    try {
      const eventRef = ref(rtdb, `calendar_events/${event.id}`);
      await set(eventRef, event);
    } catch (err) {
      console.warn("Lỗi ghi lên Firebase RTDB:", err);
    }
  }

  // 2. Ghi lên Firestore
  if (firestore) {
    try {
      const docRef = doc(firestore, "calendar_events", event.id);
      await setDoc(docRef, event);
    } catch (err) {
      console.warn("Lỗi ghi lên Firestore:", err);
    }
  }

  // 3. Luôn lưu vào API nội bộ để đảm bảo an toàn dữ liệu
  try {
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Xóa sự kiện lịch khỏi Firebase & API nội bộ
 */
export async function deleteRealtimeCalendarEvent(id: string): Promise<boolean> {
  const rtdb = getFirebaseDatabase();
  const firestore = getFirebaseFirestore();

  if (rtdb) {
    try {
      const eventRef = ref(rtdb, `calendar_events/${id}`);
      await remove(eventRef);
    } catch (err) {
      console.warn("Lỗi xóa khỏi RTDB:", err);
    }
  }

  if (firestore) {
    try {
      const docRef = doc(firestore, "calendar_events", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Lỗi xóa khỏi Firestore:", err);
    }
  }

  try {
    await fetch(`/api/calendar?id=${id}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}
