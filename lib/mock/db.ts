import { generateId } from "@/lib/utils/id";
import { loadStore, updateStore, MockRawFile } from "@/lib/mock/store";
import { NormalizedData, Settings, ShareRecord, TraitResult, UploadRecord } from "@/lib/types";

export async function createUpload(userId: string, partial: Omit<UploadRecord, "id" | "userId">) {
  const id = generateId("upload");
  const upload: UploadRecord = { ...partial, id, userId };
  updateStore((store) => ({
    ...store,
    uploads: { ...store.uploads, [id]: upload },
  }));
  return upload;
}

export async function updateUpload(uploadId: string, patch: Partial<UploadRecord>) {
  updateStore((store) => {
    const current = store.uploads[uploadId];
    if (!current) return store;
    return {
      ...store,
      uploads: { ...store.uploads, [uploadId]: { ...current, ...patch } },
    };
  });
}

export async function listUploads(userId: string) {
  const store = loadStore();
  return Object.values(store.uploads)
    .filter((upload) => upload.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getUpload(uploadId: string) {
  const store = loadStore();
  return store.uploads[uploadId] ?? null;
}

export async function saveNormalizedData(uploadId: string, data: NormalizedData) {
  updateStore((store) => ({
    ...store,
    normalized: { ...store.normalized, [uploadId]: data },
  }));
}

export async function getNormalizedData(uploadId: string) {
  const store = loadStore();
  return store.normalized[uploadId] ?? null;
}

export async function saveTraitResults(uploadId: string, results: TraitResult[]) {
  updateStore((store) => ({
    ...store,
    traits: { ...store.traits, [uploadId]: results },
  }));
}

export async function getTraitResults(uploadId: string) {
  const store = loadStore();
  return store.traits[uploadId] ?? [];
}

export async function deleteUpload(uploadId: string) {
  updateStore((store) => {
    const nextUploads = { ...store.uploads };
    const nextNormalized = { ...store.normalized };
    const nextTraits = { ...store.traits };
    const nextRaw = { ...store.rawFiles };
    delete nextUploads[uploadId];
    delete nextNormalized[uploadId];
    delete nextTraits[uploadId];
    delete nextRaw[uploadId];
    return {
      ...store,
      uploads: nextUploads,
      normalized: nextNormalized,
      traits: nextTraits,
      rawFiles: nextRaw,
    };
  });
}

export async function createShare(record: Omit<ShareRecord, "id" | "createdAt">) {
  const id = generateId("share");
  const share: ShareRecord = { ...record, id, createdAt: new Date().toISOString() };
  updateStore((store) => ({
    ...store,
    shares: { ...store.shares, [id]: share },
  }));
  return share;
}

export async function updateShare(shareId: string, patch: Partial<ShareRecord>) {
  updateStore((store) => {
    const current = store.shares[shareId];
    if (!current) return store;
    return {
      ...store,
      shares: { ...store.shares, [shareId]: { ...current, ...patch } },
    };
  });
}

export async function getShare(shareId: string) {
  const store = loadStore();
  return store.shares[shareId] ?? null;
}

export async function listShares(userId: string) {
  const store = loadStore();
  return Object.values(store.shares).filter((share) => share.userId === userId);
}

export async function getSettings() {
  const store = loadStore();
  return store.settings;
}

export async function updateSettings(settings: Partial<Settings>) {
  updateStore((store) => ({
    ...store,
    settings: { ...store.settings, ...settings },
  }));
}

export async function deleteUserData(userId: string) {
  updateStore((store) => {
    const uploads = Object.values(store.uploads).filter((upload) => upload.userId !== userId);
    const uploadIds = new Set(
      Object.values(store.uploads)
        .filter((upload) => upload.userId === userId)
        .map((upload) => upload.id)
    );
    const nextUploads: Record<string, UploadRecord> = {};
    uploads.forEach((upload) => {
      nextUploads[upload.id] = upload;
    });
    const nextNormalized: Record<string, NormalizedData> = {};
    Object.entries(store.normalized).forEach(([id, data]) => {
      if (!uploadIds.has(id)) nextNormalized[id] = data;
    });
    const nextTraits: Record<string, TraitResult[]> = {};
    Object.entries(store.traits).forEach(([id, data]) => {
      if (!uploadIds.has(id)) nextTraits[id] = data;
    });
    const nextRaw: Record<string, MockRawFile> = {};
    Object.entries(store.rawFiles).forEach(([id, data]) => {
      if (!uploadIds.has(id)) nextRaw[id] = data;
    });
    const nextShares: Record<string, ShareRecord> = {};
    Object.entries(store.shares).forEach(([id, share]) => {
      if (share.userId !== userId) nextShares[id] = share;
    });

    return {
      ...store,
      uploads: nextUploads,
      normalized: nextNormalized,
      traits: nextTraits,
      rawFiles: nextRaw,
      shares: nextShares,
      sessions: { ...store.sessions, currentUserId: undefined },
    };
  });
}
