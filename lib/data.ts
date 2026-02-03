import { firebaseEnabled } from "@/lib/env";
import * as firebaseDb from "@/lib/firebase/db";
import * as mockDb from "@/lib/mock/db";
import * as firebaseStorage from "@/lib/firebase/storage";
import * as mockStorage from "@/lib/mock/storage";
import { NormalizedData, Settings, ShareRecord, TraitResult, UploadRecord } from "@/lib/types";

export async function createUpload(userId: string, partial: Omit<UploadRecord, "id" | "userId">) {
  return firebaseEnabled ? firebaseDb.createUpload(userId, partial) : mockDb.createUpload(userId, partial);
}

export async function updateUpload(userId: string, uploadId: string, patch: Partial<UploadRecord>) {
  return firebaseEnabled
    ? firebaseDb.updateUpload(userId, uploadId, patch)
    : mockDb.updateUpload(uploadId, patch);
}

export async function listUploads(userId: string) {
  return firebaseEnabled ? firebaseDb.listUploads(userId) : mockDb.listUploads(userId);
}

export async function getUpload(userId: string, uploadId: string) {
  return firebaseEnabled ? firebaseDb.getUpload(userId, uploadId) : mockDb.getUpload(uploadId);
}

export async function saveNormalizedData(userId: string, uploadId: string, data: NormalizedData) {
  return firebaseEnabled ? firebaseDb.saveNormalizedData(userId, uploadId, data) : mockDb.saveNormalizedData(uploadId, data);
}

export async function getNormalizedData(userId: string, uploadId: string) {
  return firebaseEnabled ? firebaseDb.getNormalizedData(userId, uploadId) : mockDb.getNormalizedData(uploadId);
}

export async function saveTraitResults(userId: string, uploadId: string, results: TraitResult[]) {
  return firebaseEnabled
    ? firebaseDb.saveTraitResults(userId, uploadId, results)
    : mockDb.saveTraitResults(uploadId, results);
}

export async function getTraitResults(userId: string, uploadId: string) {
  return firebaseEnabled ? firebaseDb.getTraitResults(userId, uploadId) : mockDb.getTraitResults(uploadId);
}

export async function createShare(record: Omit<ShareRecord, "id" | "createdAt">) {
  return firebaseEnabled ? firebaseDb.createShare(record) : mockDb.createShare(record);
}

export async function updateShare(shareId: string, patch: Partial<ShareRecord>) {
  return firebaseEnabled ? firebaseDb.updateShare(shareId, patch) : mockDb.updateShare(shareId, patch);
}

export async function getShare(shareId: string) {
  return firebaseEnabled ? firebaseDb.getShare(shareId) : mockDb.getShare(shareId);
}

export async function listShares(userId: string) {
  return firebaseEnabled ? firebaseDb.listShares(userId) : mockDb.listShares(userId);
}

export async function getSettings(userId: string) {
  return firebaseEnabled ? firebaseDb.getSettings(userId) : mockDb.getSettings();
}

export async function updateSettings(userId: string, settings: Partial<Settings>) {
  return firebaseEnabled ? firebaseDb.updateSettings(userId, settings) : mockDb.updateSettings(settings);
}

export async function deleteUpload(userId: string, uploadId: string) {
  return firebaseEnabled ? firebaseDb.deleteUpload(userId, uploadId) : mockDb.deleteUpload(uploadId);
}

export async function deleteUserData(userId: string) {
  return firebaseEnabled ? firebaseDb.deleteUserData(userId) : mockDb.deleteUserData(userId);
}

export async function saveRawFile(
  userId: string,
  uploadId: string,
  buffer: ArrayBuffer,
  encrypt: boolean,
  keyBase64?: string,
  expiresAt?: string
) {
  return firebaseEnabled
    ? firebaseStorage.saveRawFile(userId, uploadId, buffer, encrypt, keyBase64)
    : mockStorage.saveRawFile(userId, uploadId, buffer, encrypt, keyBase64, expiresAt);
}

export async function deleteRawFile(userId: string, uploadId: string) {
  return firebaseEnabled ? firebaseStorage.deleteRawFile(userId, uploadId) : mockStorage.deleteRawFile(userId, uploadId);
}
