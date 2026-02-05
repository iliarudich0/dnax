import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirestoreDb } from "./firebase/client";
import { doc, setDoc } from "firebase/firestore";

export interface DNAUpload {
  id: string;
  userId: string;
  fileName: string;
  size: number;
  uploadedAt: string;
  status: "uploading" | "processing" | "completed" | "failed";
  error?: string;
}

export async function uploadDNAToCloud(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storage = getStorage();
  const db = getFirestoreDb();

  if (!db) {
    throw new Error("Database not initialized");
  }

  // Validate file type
  const validExtensions = [".txt", ".csv", ".zip"];
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  
  if (!validExtensions.includes(extension)) {
    throw new Error("Invalid file type. Supported: .txt, .csv, .zip");
  }

  // Validate file size (100MB limit)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File size must be less than 100MB");
  }

  // Generate upload ID
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const fileName = `${uploadId}${extension}`;
  
  // Upload to Storage at the path that triggers Cloud Function
  const storagePath = `users/${userId}/raw/${fileName}`;
  const storageRef = ref(storage, storagePath);

  try {
    // Upload file to Firebase Storage
    onProgress?.(50);
    await uploadBytes(storageRef, file);
    onProgress?.(100);

    // Create initial Firestore document
    await setDoc(doc(db, "users", userId, "dna_results", uploadId), {
      fileName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: "uploading",
      storagePath,
    });

    return uploadId;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Upload failed"
    );
  }
}
