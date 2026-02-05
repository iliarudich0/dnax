import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask } from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase/client";

/**
 * Upload a raw DNA file to Firebase Storage
 * Path: users/{userId}/raw/{fileName}
 */
export async function uploadDNAFile(
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ path: string; downloadURL: string }> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase not configured");

  const storage = getStorage(app);
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `users/${userId}/raw/${fileName}`;
  const storageRef = ref(storage, filePath);

  if (onProgress) {
    // Use resumable upload for progress tracking
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            path: filePath,
            downloadURL,
          });
        }
      );
    });
  } else {
    // Simple upload without progress
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return {
      path: filePath,
      downloadURL,
    };
  }
}

/**
 * Delete a DNA file from Firebase Storage
 */
export async function deleteDNAFile(filePath: string): Promise<void> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase not configured");

  const storage = getStorage(app);
  const storageRef = ref(storage, filePath);
  await deleteObject(storageRef);
}

/**
 * Get download URL for a DNA file
 */
export async function getDNAFileURL(filePath: string): Promise<string> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase not configured");

  const storage = getStorage(app);
  const storageRef = ref(storage, filePath);
  return getDownloadURL(storageRef);
}
