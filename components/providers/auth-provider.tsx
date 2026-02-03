"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/services";
import { UserProfile } from "@/lib/types";
import { firebaseEnabled } from "@/lib/env";

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authClient.onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsubscribe?.();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    await authClient.signInWithEmail(email, password);
    setLoading(false);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    await authClient.signUpWithEmail(email, password);
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    await authClient.signInWithGoogle();
    setLoading(false);
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function useAuthModeLabel() {
  return firebaseEnabled ? "Firebase" : "Mock";
}
