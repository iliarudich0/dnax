"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firebaseEnabled } from "@/lib/env";
import {
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseStorage,
} from "@/lib/firebase";
import {
  type MockUser,
  getReferral,
  mockDeleteUpload,
  mockGetUpload,
  mockListUploads,
  mockLoginUser,
  mockRegisterUser,
  mockUploadFile,
  mockGoogleUser,
} from "@/lib/mock-store";

export type AppUser = {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
};

export type AppUpload = {
  id: string;
  userId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: number;
  description?: string;
  path?: string;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  listUploads: () => Promise<AppUpload[]>;
  uploadFile: (file: File, description?: string) => Promise<AppUpload>;
  deleteUpload: (id: string) => Promise<boolean>;
  getUpload: (id: string) => Promise<AppUpload | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapMockUser(user: MockUser): AppUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatar: user.avatar,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(firebaseEnabled);

  useEffect(() => {
    if (firebaseEnabled) {
      const auth = getFirebaseAuth();
      if (!auth) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
        return;
      }
      const unsub = onAuthStateChanged(auth, (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
        } else {
          const mapped: AppUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            displayName: firebaseUser.displayName ?? firebaseUser.email ?? "User",
            avatar: firebaseUser.photoURL ?? undefined,
          };
          setUser(mapped);
        }
        setLoading(false);
      });
      return () => unsub();
    }

    const stored = window.localStorage.getItem("dnax_mock_session");
    if (stored) {
      try {
        setUser(JSON.parse(stored) as AppUser);
      } catch (error) {
        console.warn("Failed to parse session", error);
      }
    }
  }, []);

  const persistMockUser = useCallback((next: AppUser | null) => {
    if (next) {
      window.localStorage.setItem("dnax_mock_session", JSON.stringify(next));
    } else {
      window.localStorage.removeItem("dnax_mock_session");
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (firebaseEnabled) {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase nie jest skonfigurowany");
      await signInWithEmailAndPassword(auth, email, password);
      return;
    }
    const mockUser = mockLoginUser(email, password);
    const mapped = mapMockUser(mockUser);
    setUser(mapped);
    persistMockUser(mapped);
  }, [persistMockUser]);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      if (firebaseEnabled) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase nie jest skonfigurowany");
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        return;
      }
      const mockUser = mockRegisterUser({ email, password, displayName: name });
      const mapped = mapMockUser(mockUser);
      setUser(mapped);
      persistMockUser(mapped);
    },
    [persistMockUser]
  );

  const signInWithGoogle = useCallback(async () => {
    if (firebaseEnabled) {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase nie jest skonfigurowany");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return;
    }
    const mockUser = mockGoogleUser();
    const mapped = mapMockUser(mockUser);
    setUser(mapped);
    persistMockUser(mapped);
  }, [persistMockUser]);

  const signOut = useCallback(async () => {
    if (firebaseEnabled) {
      const auth = getFirebaseAuth();
      if (auth) await firebaseSignOut(auth);
    }
    setUser(null);
    persistMockUser(null);
  }, [persistMockUser]);

  const uploadFile = useCallback(
    async (file: File, description?: string) => {
      if (!user) throw new Error("Musisz być zalogowany");
      if (firebaseEnabled) {
        const storage = getFirebaseStorage();
        const firestore = getFirebaseFirestore();
        const app = getFirebaseApp();
        if (!storage || !firestore || !app) {
          throw new Error("Firebase nie jest skonfigurowany");
        }
        const path = `uploads/${user.id}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        const createdAt = Date.now();
        const docRef = await addDoc(collection(firestore, "uploads"), {
          userId: user.id,
          name: file.name,
          url,
          path,
          type: file.type,
          size: file.size,
          createdAt,
          description,
          shareable: true,
        });
        return {
          id: docRef.id,
          userId: user.id,
          name: file.name,
          url,
          path,
          type: file.type,
          size: file.size,
          createdAt,
          description,
        } satisfies AppUpload;
      }
      const upload = await mockUploadFile(file, user.id, description);
      return upload;
    },
    [user]
  );

  const listUploads = useCallback(async () => {
    if (!user) return [];
    if (firebaseEnabled) {
      const firestore = getFirebaseFirestore();
      if (!firestore) return [];
      const q = query(collection(firestore, "uploads"), where("userId", "==", user.id));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<AppUpload, "id">) }));
    }
    return mockListUploads(user.id);
  }, [user]);

  const deleteUpload = useCallback(async (id: string) => {
    if (!user) return false;
    if (firebaseEnabled) {
      const firestore = getFirebaseFirestore();
      const storage = getFirebaseStorage();
      if (!firestore) return false;
      const docRef = doc(firestore, "uploads", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as AppUpload;
        if (storage && data.path) {
          const storageRef = ref(storage, data.path);
          await deleteObject(storageRef).catch(() => undefined);
        }
        await deleteDoc(docRef);
        return true;
      }
      return false;
    }
    return mockDeleteUpload(id);
  }, [user]);

  const getUpload = useCallback(async (id: string) => {
    if (firebaseEnabled) {
      const firestore = getFirebaseFirestore();
      if (!firestore) return null;
      const snap = await getDoc(doc(firestore, "uploads", id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as Omit<AppUpload, "id">) };
    }
    return mockGetUpload(id);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      register,
      signInWithGoogle,
      signOut,
      uploadFile,
      listUploads,
      deleteUpload,
      getUpload,
    }),
    [deleteUpload, getUpload, listUploads, loading, register, signIn, signInWithGoogle, signOut, uploadFile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useReferralCode() {
  const [referral] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getReferral()
  );
  return referral;
}
