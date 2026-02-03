export type MockUser = {
  id: string;
  email: string;
  password: string;
  displayName: string;
  avatar: string;
};

export type MockUpload = {
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

const USERS_KEY = "dnax_mock_users";
const UPLOADS_KEY = "dnax_mock_uploads";
const REFERRAL_KEY = "dnax_referral";

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn("Failed to parse mock store", error);
    return fallback;
  }
}

function writeStore<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function mockRegisterUser(input: {
  email: string;
  password: string;
  displayName: string;
}) {
  const users = readStore<MockUser[]>(USERS_KEY, []);
  const existing = users.find((user) => user.email === input.email);
  if (existing) throw new Error("Użytkownik już istnieje (mock)");
  const newUser: MockUser = {
    id: crypto.randomUUID(),
    email: input.email,
    password: input.password,
    displayName: input.displayName,
    avatar: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(input.displayName)}`,
  };
  users.push(newUser);
  writeStore(USERS_KEY, users);
  return newUser;
}

export function mockLoginUser(email: string, password: string) {
  const users = readStore<MockUser[]>(USERS_KEY, []);
  const user = users.find((item) => item.email === email && item.password === password);
  if (!user) throw new Error("Nieprawidłowe dane logowania (mock)");
  return user;
}

export function mockGoogleUser() {
  const users = readStore<MockUser[]>(USERS_KEY, []);
  const tempEmail = `cosmo.${Math.random().toString(16).slice(2)}@mock.dev`;
  const user: MockUser = {
    id: crypto.randomUUID(),
    email: tempEmail,
    password: crypto.randomUUID(),
    displayName: "Cosmo Explorer",
    avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=cosmo",
  };
  users.push(user);
  writeStore(USERS_KEY, users);
  return user;
}

export function mockListUploads(userId: string) {
  const uploads = readStore<MockUpload[]>(UPLOADS_KEY, []);
  return uploads.filter((item) => item.userId === userId);
}

export function mockGetUpload(id: string) {
  const uploads = readStore<MockUpload[]>(UPLOADS_KEY, []);
  return uploads.find((item) => item.id === id) ?? null;
}

export function mockDeleteUpload(id: string) {
  const uploads = readStore<MockUpload[]>(UPLOADS_KEY, []);
  const filtered = uploads.filter((item) => item.id !== id);
  writeStore(UPLOADS_KEY, filtered);
  return filtered.length !== uploads.length;
}

export async function mockUploadFile(
  file: File,
  userId: string,
  description?: string
): Promise<MockUpload> {
  const buffer = typeof file.arrayBuffer === "function"
    ? await file.arrayBuffer()
    : await new Response(file).arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const mime = file.type || "application/octet-stream";
  const dataUrl = `data:${mime};base64,${base64}`;
  const uploads = readStore<MockUpload[]>(UPLOADS_KEY, []);
  const upload: MockUpload = {
    id: crypto.randomUUID(),
    userId,
    name: file.name,
    type: mime,
    size: file.size,
    url: dataUrl,
    createdAt: Date.now(),
    description,
    path: `mock/${userId}/${file.name}`,
  };
  uploads.unshift(upload);
  writeStore(UPLOADS_KEY, uploads);
  return upload;
}

export function storeReferral(code: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REFERRAL_KEY, code);
}

export function getReferral() {
  return typeof window === "undefined"
    ? null
    : window.localStorage.getItem(REFERRAL_KEY);
}
