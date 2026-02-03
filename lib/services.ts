import { firebaseEnabled } from "@/lib/env";
import * as firebaseAuth from "@/lib/firebase/auth";
import * as mockAuth from "@/lib/mock/auth";
import * as firebaseDb from "@/lib/firebase/db";
import * as mockDb from "@/lib/mock/db";
import * as firebaseStorage from "@/lib/firebase/storage";
import * as mockStorage from "@/lib/mock/storage";

export const authClient = firebaseEnabled ? firebaseAuth : mockAuth;
export const dbClient = firebaseEnabled ? firebaseDb : mockDb;
export const storageClient = firebaseEnabled ? firebaseStorage : mockStorage;
