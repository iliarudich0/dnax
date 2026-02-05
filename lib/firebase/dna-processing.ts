import { collection, doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase/client";

export interface DNAProcessingResult {
  totalSnps: number;
  sampleSnps: Array<{
    rsid: string;
    chromosome: string;
    position: string;
    genotype: string;
  }>;
  processedAt: string;
  fileSize: number;
  fileName: string;
  status: "processing" | "completed" | "failed";
  error?: string;
  uploadPath?: string;
}

/**
 * Listen to DNA processing results in real-time
 */
export function onDNAProcessingResult(
  userId: string,
  fileId: string,
  callback: (result: DNAProcessingResult | null) => void
): Unsubscribe {
  const app = getFirebaseApp();
  if (!app) {
    callback(null);
    return () => {};
  }

  const db = getFirestore(app);
  const docRef = doc(db, "users", userId, "dna_results", fileId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as DNAProcessingResult);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to DNA processing result:", error);
      callback(null);
    }
  );
}

/**
 * Listen to all DNA processing results for a user
 */
export function onDNAProcessingResults(
  userId: string,
  callback: (results: Array<DNAProcessingResult & { id: string }>) => void
): Unsubscribe {
  const app = getFirebaseApp();
  if (!app) {
    callback([]);
    return () => {};
  }

  const db = getFirestore(app);
  const colRef = collection(db, "users", userId, "dna_results");

  return onSnapshot(
    colRef,
    (snapshot) => {
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Array<DNAProcessingResult & { id: string }>;
      callback(results);
    },
    (error) => {
      console.error("Error listening to DNA processing results:", error);
      callback([]);
    }
  );
}
