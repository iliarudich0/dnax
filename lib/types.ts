export type TraitCategory = "Lifestyle" | "Nutrition" | "Physical" | "Appearance";

export type UserProfile = {
  id: string;
  email?: string;
  name?: string;
  photoURL?: string;
  createdAt: string;
};

export type UploadStatus = "processing" | "ready" | "failed";

export type UploadRecord = {
  id: string;
  userId: string;
  fileName: string;
  provider: string;
  size: number;
  createdAt: string;
  processedAt?: string;
  rawExpiresAt?: string;
  rawDeletedAt?: string;
  status: UploadStatus;
  summary: {
    totalSnps: number;
    parsedSnps: number;
    chromosomes: number;
  };
};

export type NormalizedSnp = {
  rsid: string;
  chrom: string;
  pos: number | null;
  genotype: string;
};

export type NormalizedData = {
  uploadId: string;
  createdAt: string;
  snps: NormalizedSnp[];
  genotypeMap: Record<string, string>;
};

export type TraitResult = {
  traitId: string;
  name: string;
  category: TraitCategory;
  genotype: string;
  outcome: string;
  summary: string;
  confidence: "Low" | "Medium" | "High";
  whatItMeans: string;
  whatYouCanDo: string[];
  limitations: string[];
  sources: { label: string; url: string }[];
};

export type ShareRecord = {
  id: string;
  userId: string;
  uploadId: string;
  createdAt: string;
  enabled: boolean;
  headline: string;
  topTraits: Array<Pick<TraitResult, "traitId" | "name" | "category" | "outcome">>;
  note: string;
};

export type Settings = {
  retentionDays: number;
  encryptionEnabled: boolean;
};
