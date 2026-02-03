import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { env, firebaseEnabled } from "@/lib/env";

const firebaseConfig = firebaseEnabled
  ? {
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    }
  : null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseEnabled || !firebaseConfig) return null;
  if (typeof window === "undefined") return null;
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0]!;
}
