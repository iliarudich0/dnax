import { getStorage, ref, uploadBytes, deleteObject, getBytes } from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase/client";
import { encryptArrayBuffer, decryptToArrayBuffer, EncryptedPayload } from "@/lib/crypto";

function getStorageClient() {
  const app = getFirebaseApp();
  if (!app) return null;
  return getStorage(app);
}

export async function saveRawFile(
  userId: string,
  uploadId: string,
  data: ArrayBuffer,
  encrypt: boolean,
  keyBase64?: string
) {
  const storage = getStorageClient();
  if (!storage) return;
  if (encrypt && keyBase64) {
    const encrypted = await encryptArrayBuffer(data, keyBase64);
    const payload = JSON.stringify(encrypted);
    const blob = new Blob([payload], { type: "application/json" });
    await uploadBytes(ref(storage, `users/${userId}/raw/${uploadId}.json`), blob, {
      contentType: "application/json",
    });
    return;
  }

  const blob = new Blob([data], { type: "text/plain" });
  await uploadBytes(ref(storage, `users/${userId}/raw/${uploadId}.txt`), blob, {
    contentType: "text/plain",
  });
}

export async function getRawFile(
  userId: string,
  uploadId: string,
  encrypted: boolean,
  keyBase64?: string
) {
  const storage = getStorageClient();
  if (!storage) return null;
  if (encrypted) {
    const bytes = await getBytes(ref(storage, `users/${userId}/raw/${uploadId}.json`));
    if (!keyBase64) return null;
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as EncryptedPayload;
    return decryptToArrayBuffer(payload, keyBase64);
  }
  return getBytes(ref(storage, `users/${userId}/raw/${uploadId}.txt`));
}

export async function deleteRawFile(userId: string, uploadId: string) {
  const storage = getStorageClient();
  if (!storage) return;
  const rawRef = ref(storage, `users/${userId}/raw/${uploadId}.txt`);
  const encRef = ref(storage, `users/${userId}/raw/${uploadId}.json`);
  try {
    await deleteObject(rawRef);
  } catch {
    // ignore
  }
  try {
    await deleteObject(encRef);
  } catch {
    // ignore
  }
}
