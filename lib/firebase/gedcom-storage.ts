import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestoreDb } from "./client";
import { doc, setDoc, collection, query, orderBy, getDocs } from "firebase/firestore";

export interface GEDCOMFile {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  downloadUrl?: string;
  status: "uploaded" | "processing" | "completed" | "failed";
  error?: string;
}

export async function uploadGEDCOMFile(
  file: File,
  uploadId: string,
  onProgress?: (progress: number) => void
): Promise<GEDCOMFile> {
  const storage = getStorage();
  const db = getFirestoreDb();

  if (!db) {
    throw new Error("Database not initialized");
  }

  // Get current user
  const { getAuth } = await import("firebase/auth");
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User must be authenticated to upload files");
  }

  // Validate file type
  if (!file.name.toLowerCase().endsWith('.ged')) {
    throw new Error("Only GEDCOM files (.ged) are allowed");
  }

  // Validate file size (100MB limit)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 100MB");
  }

  const fileName = `${user.uid}/${uploadId}_${file.name}`;
  const storageRef = ref(storage, `gedcom/${fileName}`);

  // Create upload task
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => {
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const gedcomFile: GEDCOMFile = {
            id: uploadId,
            userId: user.uid,
            fileName,
            originalName: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            downloadUrl: downloadURL,
            status: "uploaded",
          };

          // Save to Firestore
          await setDoc(doc(db, "gedcom_files", uploadId), gedcomFile);

          resolve(gedcomFile);
        } catch (error) {
          reject(new Error("Failed to save file metadata"));
        }
      }
    );
  });
}

export async function getUserGEDCOMFiles(): Promise<GEDCOMFile[]> {
  const db = getFirestoreDb();

  if (!db) {
    throw new Error("Database not initialized");
  }

  const { getAuth } = await import("firebase/auth");
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User must be authenticated");
  }

  const q = query(
    collection(db, "gedcom_files"),
    orderBy("uploadedAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const files: GEDCOMFile[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data() as GEDCOMFile;
    if (data.userId === user.uid) {
      files.push(data);
    }
  });

  return files;
}

export async function deleteGEDCOMFile(fileId: string): Promise<void> {
  const { getStorage, ref, deleteObject } = await import("firebase/storage");
  const { getFirestoreDb } = await import("./client");
  const { doc, deleteDoc } = await import("firebase/firestore");

  const storage = getStorage();
  const db = getFirestoreDb();

  if (!db) {
    throw new Error("Database not initialized");
  }

  const { getAuth } = await import("firebase/auth");
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User must be authenticated");
  }

  // Get file data first
  const fileDoc = await getDocs(query(collection(db, "gedcom_files")));
  let foundFile: GEDCOMFile | null = null;

  fileDoc.forEach((doc) => {
    const data = doc.data() as GEDCOMFile;
    if (data.id === fileId && data.userId === user.uid) {
      foundFile = data;
    }
  });

  if (!foundFile) {
    throw new Error("File not found or access denied");
  }

  // Delete from Storage
  const storageRef = ref(storage, `gedcom/${(foundFile as GEDCOMFile).fileName}`);
  await deleteObject(storageRef);

  // Delete from Firestore
  await deleteDoc(doc(db, "gedcom_files", fileId));
}
