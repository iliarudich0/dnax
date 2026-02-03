import { NormalizedData, NormalizedSnp } from "@/lib/types";

const COMMENT_PREFIXES = ["#", "//"];
const HEADER_KEYS = ["rsid", "chromosome", "chrom", "chr", "position", "pos", "genotype", "result", "allele1", "allele2", "allele_1", "allele_2"];

export type ParsedFile = {
  provider: string;
  snps: NormalizedSnp[];
  summary: {
    totalLines: number;
    parsedSnps: number;
    chromosomes: number;
  };
};

export function normalizeGenotype(raw: string | undefined | null): string {
  if (!raw) return "--";
  const cleaned = raw.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (cleaned.length === 0) return "--";
  if (cleaned.length === 1) return cleaned;
  if (cleaned.length >= 2) {
    const letters = cleaned.slice(0, 2).split("").sort();
    return letters.join("");
  }
  return "--";
}

function looksLikeHeader(line: string) {
  const lowered = line.toLowerCase();
  return HEADER_KEYS.some((key) => lowered.includes(key));
}

function detectDelimiter(line: string) {
  if (line.includes("\t")) return "\t";
  if (line.includes(",")) return ",";
  return /\s+/.test(line) ? "whitespace" : "\t";
}

function splitLine(line: string, delimiter: string) {
  if (delimiter === "whitespace") {
    return line.trim().split(/\s+/);
  }
  return line.split(delimiter).map((part) => part.trim());
}

function buildHeaderIndex(headerCells: string[]) {
  const index: Record<string, number> = {};
  headerCells.forEach((cell, idx) => {
    const normalized = cell.trim().toLowerCase();
    if (normalized && !index[normalized]) {
      index[normalized] = idx;
    }
  });
  return index;
}

function resolveColumn(index: Record<string, number>, keys: string[]) {
  for (const key of keys) {
    if (index[key] !== undefined) return index[key];
  }
  return null;
}

export function parseRawFile(text: string): ParsedFile {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const totalLines = lines.length;
  const snps: NormalizedSnp[] = [];
  let provider = "Unknown";
  let headerIndex: Record<string, number> | null = null;
  let delimiter = "\t";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (COMMENT_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) continue;

    if (!headerIndex && looksLikeHeader(trimmed)) {
      delimiter = detectDelimiter(trimmed);
      const headerCells = splitLine(trimmed, delimiter);
      headerIndex = buildHeaderIndex(headerCells);
      const providerHint = headerCells.join(" ").toLowerCase();
      if (providerHint.includes("23andme")) provider = "23andMe";
      if (providerHint.includes("ancestry")) provider = "AncestryDNA";
      if (providerHint.includes("myheritage")) provider = "MyHeritage";
      continue;
    }

    if (!headerIndex) {
      delimiter = detectDelimiter(trimmed);
    }

    const cells = splitLine(trimmed, delimiter);
    if (cells.length < 3) continue;

    let rsid: string;
    let chrom: string;
    let pos: number | null;
    let genotype: string;

    if (headerIndex) {
      const rsidIdx = resolveColumn(headerIndex, ["rsid"]);
      const chromIdx = resolveColumn(headerIndex, ["chromosome", "chrom", "chr"]);
      const posIdx = resolveColumn(headerIndex, ["position", "pos"]);
      const genotypeIdx = resolveColumn(headerIndex, ["genotype", "result"]);
      const allele1Idx = resolveColumn(headerIndex, ["allele1", "allele_1"]);
      const allele2Idx = resolveColumn(headerIndex, ["allele2", "allele_2"]);

      if (rsidIdx === null || chromIdx === null) continue;

      rsid = cells[rsidIdx] ?? "";
      chrom = cells[chromIdx] ?? "";
      const posValue = posIdx !== null ? cells[posIdx] : "";
      pos = posValue ? Number.parseInt(posValue, 10) : null;

      if (genotypeIdx !== null) {
        genotype = cells[genotypeIdx] ?? "";
      } else {
        const allele1 = allele1Idx !== null ? cells[allele1Idx] : "";
        const allele2 = allele2Idx !== null ? cells[allele2Idx] : "";
        genotype = `${allele1 ?? ""}${allele2 ?? ""}`;
      }
    } else {
      rsid = cells[0] ?? "";
      chrom = cells[1] ?? "";
      const posValue = cells[2] ?? "";
      pos = posValue ? Number.parseInt(posValue, 10) : null;
      genotype = cells[3] ?? "";
      provider = "23andMe-like";
    }

    if (!rsid || !rsid.startsWith("rs")) continue;

    snps.push({
      rsid: rsid.trim(),
      chrom: chrom.trim(),
      pos: Number.isFinite(pos) ? pos : null,
      genotype: normalizeGenotype(genotype),
    });
  }

  const chromosomes = new Set(snps.map((snp) => snp.chrom)).size;

  return {
    provider,
    snps,
    summary: {
      totalLines,
      parsedSnps: snps.length,
      chromosomes,
    },
  };
}

export function toNormalizedData(uploadId: string, parsed: ParsedFile): NormalizedData {
  const genotypeMap: Record<string, string> = {};
  parsed.snps.forEach((snp) => {
    genotypeMap[snp.rsid] = snp.genotype;
  });

  return {
    uploadId,
    createdAt: new Date().toISOString(),
    snps: parsed.snps,
    genotypeMap,
  };
}
