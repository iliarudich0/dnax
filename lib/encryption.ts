import { generateKeyBase64 } from "@/lib/crypto";

const KEY_STORAGE = "genomelink_encryption_key";

export async function getOrCreateLocalKey() {
  if (typeof window === "undefined") return null;
  const existing = window.localStorage.getItem(KEY_STORAGE);
  if (existing) return existing;
  const key = await generateKeyBase64();
  window.localStorage.setItem(KEY_STORAGE, key);
  return key;
}

export function clearLocalKey() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_STORAGE);
}
