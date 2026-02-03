import { encryptArrayBuffer, generateKeyBase64, decryptToArrayBuffer, EncryptedPayload } from "@/lib/crypto";
import { loadStore, updateStore } from "@/lib/mock/store";

function bufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBuffer(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function getOrCreateEncryptionKey() {
  const store = loadStore();
  if (store.encryptionKey) return store.encryptionKey;
  const key = await generateKeyBase64();
  updateStore((next) => ({ ...next, encryptionKey: key }));
  return key;
}

export async function saveRawFile(
  _userId: string,
  uploadId: string,
  buffer: ArrayBuffer,
  encrypt: boolean,
  keyBase64?: string,
  expiresAt?: string
) {
  if (encrypt) {
    const key = keyBase64 ?? (await getOrCreateEncryptionKey());
    const encrypted = await encryptArrayBuffer(buffer, key);
    updateStore((store) => ({
      ...store,
      rawFiles: {
        ...store.rawFiles,
        [uploadId]: {
          uploadId,
          data: encrypted.data,
          iv: encrypted.iv,
          encrypted: true,
          createdAt: new Date().toISOString(),
          expiresAt,
        },
      },
    }));
    return;
  }

  const encoded = bufferToBase64(buffer);
  updateStore((store) => ({
    ...store,
    rawFiles: {
      ...store.rawFiles,
      [uploadId]: {
        uploadId,
        data: encoded,
        encrypted: false,
        createdAt: new Date().toISOString(),
        expiresAt,
      },
    },
  }));
}

export async function getRawFile(_userId: string, uploadId: string, encrypted: boolean, keyBase64?: string) {
  const store = loadStore();
  const raw = store.rawFiles[uploadId];
  if (!raw) return null;
  if (raw.expiresAt && new Date(raw.expiresAt).getTime() < Date.now()) {
    await deleteRawFile(_userId, uploadId);
    return null;
  }
  if (!raw.encrypted) {
    return base64ToBuffer(raw.data);
  }
  const key = keyBase64 ?? store.encryptionKey;
  if (!raw.iv || !key) return null;
  const payload: EncryptedPayload = { data: raw.data, iv: raw.iv };
  return decryptToArrayBuffer(payload, key);
}

export async function deleteRawFile(_userId: string, uploadId: string) {
  updateStore((store) => {
    const next = { ...store.rawFiles };
    delete next[uploadId];
    return { ...store, rawFiles: next };
  });
}

export async function pruneExpiredRaw() {
  const store = loadStore();
  const now = Date.now();
  Object.values(store.rawFiles).forEach((raw) => {
    if (raw.expiresAt && new Date(raw.expiresAt).getTime() < now) {
      updateStore((current) => {
        const next = { ...current.rawFiles };
        delete next[raw.uploadId];
        return { ...current, rawFiles: next };
      });
    }
  });
}
