import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase/client";
import { NormalizedData, Settings, ShareRecord, TraitResult, UploadRecord } from "@/lib/types";
import { generateId } from "@/lib/utils/id";

function getDb() {
  const app = getFirebaseApp();
  if (!app) return null;
  return getFirestore(app);
}

export async function createUpload(userId: string, partial: Omit<UploadRecord, "id" | "userId">) {
  const db = getDb();
  if (!db) throw new Error("Firebase not configured");
  const id = generateId("upload");
  const upload: UploadRecord = { ...partial, id, userId };
  await setDoc(doc(db, "users", userId, "uploads", id), upload);
  return upload;
}

export async function updateUpload(userId: string, uploadId: string, patch: Partial<UploadRecord>) {
  const db = getDb();
  if (!db) return;
  await updateDoc(doc(db, "users", userId, "uploads", uploadId), patch as Record<string, unknown>);
}

export async function listUploads(userId: string) {
  const db = getDb();
  if (!db) return [];
  const q = query(collection(db, "users", userId, "uploads"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((docItem) => docItem.data() as UploadRecord);
}

export async function getUpload(userId: string, uploadId: string) {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", userId, "uploads", uploadId));
  return snap.exists() ? (snap.data() as UploadRecord) : null;
}

export async function saveNormalizedData(userId: string, uploadId: string, data: NormalizedData) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, "users", userId, "normalized", uploadId), data);
}

export async function getNormalizedData(userId: string, uploadId: string) {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", userId, "normalized", uploadId));
  return snap.exists() ? (snap.data() as NormalizedData) : null;
}

export async function saveTraitResults(userId: string, uploadId: string, results: TraitResult[]) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, "users", userId, "traits", uploadId), {
    uploadId,
    results,
    updatedAt: new Date().toISOString(),
  });
}

export async function getTraitResults(userId: string, uploadId: string) {
  const db = getDb();
  if (!db) return [];
  const snap = await getDoc(doc(db, "users", userId, "traits", uploadId));
  if (!snap.exists()) return [];
  const data = snap.data() as { results: TraitResult[] };
  return data.results ?? [];
}

export async function createShare(record: Omit<ShareRecord, "id" | "createdAt">) {
  const db = getDb();
  if (!db) throw new Error("Firebase not configured");
  const id = generateId("share");
  const share: ShareRecord = { ...record, id, createdAt: new Date().toISOString() };
  await setDoc(doc(db, "shares", id), share);
  return share;
}

export async function updateShare(shareId: string, patch: Partial<ShareRecord>) {
  const db = getDb();
  if (!db) return;
  await updateDoc(doc(db, "shares", shareId), patch as Record<string, unknown>);
}

export async function getShare(shareId: string) {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "shares", shareId));
  return snap.exists() ? (snap.data() as ShareRecord) : null;
}

export async function listShares(userId: string) {
  const db = getDb();
  if (!db) return [];
  const q = query(collection(db, "shares"));
  const snap = await getDocs(q);
  return snap.docs
    .map((docItem) => docItem.data() as ShareRecord)
    .filter((share) => share.userId === userId);
}

export async function getSettings(userId: string) {
  const db = getDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", userId, "settings", "profile"));
  return snap.exists() ? (snap.data() as Settings) : null;
}

export async function updateSettings(userId: string, settings: Partial<Settings>) {
  const db = getDb();
  if (!db) return;
  await setDoc(doc(db, "users", userId, "settings", "profile"), settings, { merge: true });
}

export async function deleteUpload(userId: string, uploadId: string) {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, "users", userId, "uploads", uploadId));
  await deleteDoc(doc(db, "users", userId, "normalized", uploadId));
  await deleteDoc(doc(db, "users", userId, "traits", uploadId));
}

export async function deleteUserData(userId: string) {
  const db = getDb();
  if (!db) return;
  const batch = writeBatch(db);

  const uploadsSnap = await getDocs(collection(db, "users", userId, "uploads"));
  uploadsSnap.docs.forEach((docItem) => batch.delete(docItem.ref));

  const normalizedSnap = await getDocs(collection(db, "users", userId, "normalized"));
  normalizedSnap.docs.forEach((docItem) => batch.delete(docItem.ref));

  const traitsSnap = await getDocs(collection(db, "users", userId, "traits"));
  traitsSnap.docs.forEach((docItem) => batch.delete(docItem.ref));

  const sharesSnap = await getDocs(collection(db, "shares"));
  sharesSnap.docs.forEach((docItem) => {
    const share = docItem.data() as ShareRecord;
    if (share.userId === userId) batch.delete(docItem.ref);
  });

  await batch.commit();
}
