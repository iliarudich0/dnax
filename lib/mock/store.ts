import { NormalizedData, Settings, ShareRecord, TraitResult, UploadRecord, UserProfile } from "@/lib/types";
import { encryptionEnabledByDefault, retentionDays } from "@/lib/env";

export type MockRawFile = {
  uploadId: string;
  data: string;
  encrypted: boolean;
  iv?: string;
  createdAt: string;
  expiresAt?: string;
};

export type MockStore = {
  users: Record<string, UserProfile>;
  uploads: Record<string, UploadRecord>;
  normalized: Record<string, NormalizedData>;
  traits: Record<string, TraitResult[]>;
  shares: Record<string, ShareRecord>;
  rawFiles: Record<string, MockRawFile>;
  settings: Settings;
  sessions: {
    currentUserId?: string;
  };
  encryptionKey?: string;
};

const STORAGE_KEY = "genomelink_mvp_store";

const defaultStore: MockStore = {
  users: {},
  uploads: {},
  normalized: {},
  traits: {},
  shares: {},
  rawFiles: {},
  settings: {
    retentionDays: retentionDays || 7,
    encryptionEnabled: encryptionEnabledByDefault,
  },
  sessions: {},
};

export function loadStore(): MockStore {
  if (typeof window === "undefined") return { ...defaultStore };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultStore };
  try {
    const parsed = JSON.parse(raw) as MockStore;
    return {
      ...defaultStore,
      ...parsed,
      settings: { ...defaultStore.settings, ...(parsed.settings ?? {}) },
      sessions: { ...defaultStore.sessions, ...(parsed.sessions ?? {}) },
    };
  } catch {
    return { ...defaultStore };
  }
}

export function saveStore(store: MockStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function updateStore(mutator: (store: MockStore) => MockStore) {
  const store = loadStore();
  const next = mutator(store);
  saveStore(next);
  return next;
}

export function getCurrentUserId() {
  const store = loadStore();
  return store.sessions.currentUserId;
}

export function setCurrentUserId(userId?: string) {
  return updateStore((store) => ({
    ...store,
    sessions: { ...store.sessions, currentUserId: userId },
  }));
}

export function clearStore() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
