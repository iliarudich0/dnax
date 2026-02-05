import {
  getAuth,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";
import { UserProfile } from "@/lib/types";

export type AuthCallback = (user: UserProfile | null) => void;

function toUserProfile(user: import("firebase/auth").User): UserProfile {
  return {
    id: user.uid,
    email: user.email ?? undefined,
    name: user.displayName ?? user.email?.split("@")[0],
    photoURL: user.photoURL ?? undefined,
    createdAt: new Date(user.metadata.creationTime ?? Date.now()).toISOString(),
  };
}

export function onAuthStateChanged(callback: AuthCallback) {
  const app = getFirebaseApp();
  if (!app) {
    callback(null);
    return () => undefined;
  }
  const auth = getAuth(app);
  return firebaseOnAuthStateChanged(auth, (user) => {
    callback(user ? toUserProfile(user) : null);
  });
}

export async function signInWithEmail(email: string, password: string) {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase not configured");
  const auth = getAuth(app);
  const result = await signInWithEmailAndPassword(auth, email, password);
  return toUserProfile(result.user);
}

export async function signUpWithEmail(email: string, password: string) {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase not configured");
  const auth = getAuth(app);
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return toUserProfile(result.user);
}

export async function signInWithGoogle() {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase not configured");
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
  // User will be redirected, no return needed
}

export async function handleRedirectResult() {
  const app = getFirebaseApp();
  if (!app) return null;
  const auth = getAuth(app);
  const result = await getRedirectResult(auth);
  return result?.user ? toUserProfile(result.user) : null;
}

export async function signOut() {
  const app = getFirebaseApp();
  if (!app) return;
  const auth = getAuth(app);
  await firebaseSignOut(auth);
}

export function getCurrentUser() {
  const app = getFirebaseApp();
  if (!app) return null;
  const auth = getAuth(app);
  return auth.currentUser ? toUserProfile(auth.currentUser) : null;
}
