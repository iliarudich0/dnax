import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_USE_FIREBASE: z.string().optional(),
  NEXT_PUBLIC_BASE_PATH: z.string().optional(),
  NEXT_PUBLIC_RETENTION_DAYS: z.string().optional(),
  NEXT_PUBLIC_ENABLE_ENCRYPTION: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_USE_FIREBASE: process.env.NEXT_PUBLIC_USE_FIREBASE,
  NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
  NEXT_PUBLIC_RETENTION_DAYS: process.env.NEXT_PUBLIC_RETENTION_DAYS,
  NEXT_PUBLIC_ENABLE_ENCRYPTION: process.env.NEXT_PUBLIC_ENABLE_ENCRYPTION,
});

if (!parsed.success) {
  console.warn("Environment validation failed", parsed.error.flatten().fieldErrors);
}

export const env = parsed.success ? parsed.data : {};

export const firebaseEnabled = Boolean(
  env.NEXT_PUBLIC_USE_FIREBASE === "true" &&
    env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    env.NEXT_PUBLIC_FIREBASE_APP_ID
);

export const mockMode = !firebaseEnabled;

export const retentionDays = Number(env.NEXT_PUBLIC_RETENTION_DAYS ?? "7");
export const encryptionEnabledByDefault = env.NEXT_PUBLIC_ENABLE_ENCRYPTION === "true";
