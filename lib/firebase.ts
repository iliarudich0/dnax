import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { env, firebaseEnabled } from "./env";

let app: FirebaseApp | null = null;

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

function ensureApp(): FirebaseApp | null {
  if (!firebaseEnabled || !firebaseConfig) return null;
  if (app) return app;
  if (typeof window === "undefined") return null;
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]!;
  }
  return app;
}

export function getFirebaseApp() {
  return ensureApp();
}

export function getFirebaseAuth(): Auth | null {
  const current = ensureApp();
  return current ? getAuth(current) : null;
}

export function getFirebaseFirestore(): Firestore | null {
  const current = ensureApp();
  return current ? getFirestore(current) : null;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const current = ensureApp();
  return current ? getStorage(current) : null;
}
