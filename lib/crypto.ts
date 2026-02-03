export type EncryptedPayload = {
  iv: string;
  data: string;
};

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function generateKeyBase64() {
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const raw = await crypto.subtle.exportKey("raw", key);
  return toBase64(new Uint8Array(raw));
}

async function importKey(base64: string) {
  const raw = fromBase64(base64);
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptArrayBuffer(data: ArrayBuffer, keyBase64: string): Promise<EncryptedPayload> {
  const key = await importKey(keyBase64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return {
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(encrypted)),
  };
}

export async function decryptToArrayBuffer(payload: EncryptedPayload, keyBase64: string) {
  const key = await importKey(keyBase64);
  const iv = fromBase64(payload.iv);
  const data = fromBase64(payload.data);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
}
