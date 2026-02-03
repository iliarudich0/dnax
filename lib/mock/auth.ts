import { generateId } from "@/lib/utils/id";
import { UserProfile } from "@/lib/types";
import { loadStore, setCurrentUserId, updateStore } from "@/lib/mock/store";

export type AuthCallback = (user: UserProfile | null) => void;

const listeners = new Set<AuthCallback>();

function emit(user: UserProfile | null) {
  listeners.forEach((cb) => cb(user));
}

export function onAuthStateChanged(callback: AuthCallback) {
  listeners.add(callback);
  const store = loadStore();
  const userId = store.sessions.currentUserId;
  const user = userId ? store.users[userId] : null;
  callback(user ?? null);
  return () => listeners.delete(callback);
}

export async function signInWithEmail(email: string, password: string) {
  if (!email || !password) throw new Error("Missing credentials");
  const store = loadStore();
  const existing = Object.values(store.users).find((user) => user.email === email);
  if (existing) {
    setCurrentUserId(existing.id);
    emit(existing);
    return existing;
  }
  throw new Error("No user found. Create an account first.");
}

export async function signUpWithEmail(email: string, password: string) {
  if (!email || !password) throw new Error("Missing credentials");
  const id = generateId("user");
  const user: UserProfile = {
    id,
    email,
    name: email.split("@")[0],
    createdAt: new Date().toISOString(),
  };
  updateStore((store) => ({
    ...store,
    users: { ...store.users, [id]: user },
    sessions: { ...store.sessions, currentUserId: id },
  }));
  emit(user);
  return user;
}

export async function signInWithGoogle() {
  const id = generateId("user");
  const user: UserProfile = {
    id,
    email: "mock.user@example.com",
    name: "Mock User",
    createdAt: new Date().toISOString(),
  };
  updateStore((store) => ({
    ...store,
    users: { ...store.users, [id]: user },
    sessions: { ...store.sessions, currentUserId: id },
  }));
  emit(user);
  return user;
}

export async function signOut() {
  setCurrentUserId(undefined);
  emit(null);
}

export function getCurrentUser() {
  const store = loadStore();
  const userId = store.sessions.currentUserId;
  return userId ? store.users[userId] : null;
}
