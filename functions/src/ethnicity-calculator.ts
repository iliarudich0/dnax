/**
 * Ethnicity Calculator - Commercial-Use Open Source
 * 
 * Uses ancestry-informative markers (AIMs) to estimate genetic ancestry.
 * Based on publicly available genetic research and population genetics data.
 * 
 * License: MIT (commercial use allowed)
 * Reference: 1000 Genomes Project, HapMap, published genetic studies
 */

export interface SNP {
  rsid: string;
  chromosome: string;
  position: string;
  genotype: string;
}

export interface PopulationFrequencies {
  [rsid: string]: {
    [population: string]: {
      [allele: string]: number;
    };
  };
}

export interface EthnicityResult {
  ancestry: {
    [population: string]: number;
  };
  confidence: number;
  markers_used: number;
  total_markers: number;
}

/**
 * Ancestry-Informative Markers (AIMs)
 * These SNPs show significant frequency differences between populations
 * Data compiled from public genetic studies and 1000 Genomes Project
 */
export const ANCESTRY_MARKERS: PopulationFrequencies = {
  // SLC24A5 - European skin pigmentation marker
  "rs1426654": {
    "European": { "A": 0.99, "G": 0.01 },
    "African": { "A": 0.02, "G": 0.98 },
    "East_Asian": { "A": 0.97, "G": 0.03 },
    "South_Asian": { "A": 0.65, "G": 0.35 },
    "Native_American": { "A": 0.95, "G": 0.05 },
    "Middle_Eastern": { "A": 0.85, "G": 0.15 }
  },
  
  // EDAR - East Asian hair thickness
  "rs3827760": {
    "European": { "A": 0.92, "G": 0.08 },
    "African": { "A": 0.98, "G": 0.02 },
    "East_Asian": { "A": 0.15, "G": 0.85 },
    "South_Asian": { "A": 0.75, "G": 0.25 },
    "Native_American": { "A": 0.35, "G": 0.65 },
    "Middle_Eastern": { "A": 0.88, "G": 0.12 }
  },

  // LCT - Lactose tolerance (European)
  "rs4988235": {
    "European": { "T": 0.52, "C": 0.48 },
    "African": { "T": 0.08, "C": 0.92 },
    "East_Asian": { "T": 0.02, "C": 0.98 },
    "South_Asian": { "T": 0.28, "C": 0.72 },
    "Native_American": { "T": 0.05, "C": 0.95 },
    "Middle_Eastern": { "T": 0.42, "C": 0.58 }
  },

  // HERC2 - Eye color (European blue eyes)
  "rs12913832": {
    "European": { "A": 0.28, "G": 0.72 },
    "African": { "A": 0.95, "G": 0.05 },
    "East_Asian": { "A": 0.98, "G": 0.02 },
    "South_Asian": { "A": 0.88, "G": 0.12 },
    "Native_American": { "A": 0.92, "G": 0.08 },
    "Middle_Eastern": { "A": 0.82, "G": 0.18 }
  },

  // DARC - Duffy antigen (African malaria resistance)
  "rs2814778": {
    "European": { "T": 0.98, "C": 0.02 },
    "African": { "T": 0.02, "C": 0.98 },
    "East_Asian": { "T": 0.95, "C": 0.05 },
    "South_Asian": { "T": 0.85, "C": 0.15 },
    "Native_American": { "T": 0.92, "C": 0.08 },
    "Middle_Eastern": { "T": 0.88, "C": 0.12 }
  },

  // OCA2 - Skin/eye color
  "rs1800407": {
    "European": { "C": 0.93, "T": 0.07 },
    "African": { "C": 0.98, "T": 0.02 },
    "East_Asian": { "C": 0.99, "T": 0.01 },
    "South_Asian": { "C": 0.95, "T": 0.05 },
    "Native_American": { "C": 0.97, "T": 0.03 },
    "Middle_Eastern": { "C": 0.94, "T": 0.06 }
  },

  // ABCC11 - Earwax type (East Asian dry earwax)
  "rs17822931": {
    "European": { "T": 0.02, "C": 0.98 },
    "African": { "T": 0.00, "C": 1.00 },
    "East_Asian": { "T": 0.85, "C": 0.15 },
    "South_Asian": { "T": 0.12, "C": 0.88 },
    "Native_American": { "T": 0.65, "C": 0.35 },
    "Middle_Eastern": { "T": 0.05, "C": 0.95 }
  },

  // ADH1B - Alcohol metabolism (East Asian)
  "rs1229984": {
    "European": { "T": 0.96, "C": 0.04 },
    "African": { "T": 0.98, "C": 0.02 },
    "East_Asian": { "T": 0.32, "C": 0.68 },
    "South_Asian": { "T": 0.78, "C": 0.22 },
    "Native_American": { "T": 0.88, "C": 0.12 },
    "Middle_Eastern": { "T": 0.85, "C": 0.15 }
  }
};

const POPULATIONS = [
  "European",
  "African", 
  "East_Asian",
  "South_Asian",
  "Native_American",
  "Middle_Eastern"
];

/**
 * Calculate ethnicity from SNP data
 */
export function calculateEthnicity(snps: SNP[]): EthnicityResult {
  const scores: { [population: string]: number } = {};
  let markersUsed = 0;

  // Initialize scores
  POPULATIONS.forEach(pop => {
    scores[pop] = 0;
  });

  // Score each SNP against reference populations
  for (const snp of snps) {
    const markerData = ANCESTRY_MARKERS[snp.rsid];
    if (!markerData) continue;

    markersUsed++;
    const alleles = extractAlleles(snp.genotype);

    // Calculate likelihood for each population
    POPULATIONS.forEach(population => {
      const popFreqs = markerData[population];
      if (!popFreqs) return;

      let likelihood = 1.0;
      
      // For each allele in the genotype
      for (const allele of alleles) {
        const freq = popFreqs[allele] || 0.01; // Small freq for unknown alleles
        likelihood *= freq;
      }

      scores[population] += Math.log(likelihood + 0.0001); // Add log-likelihood
    });
  }

  // Convert log-likelihoods to probabilities
  const maxScore = Math.max(...Object.values(scores));
  const expScores: { [pop: string]: number } = {};
  let totalExp = 0;

  POPULATIONS.forEach(pop => {
    const exp = Math.exp(scores[pop] - maxScore); // Normalize to prevent overflow
    expScores[pop] = exp;
    totalExp += exp;
  });

  // Normalize to percentages and ensure they sum to 100%
  const ancestry: { [pop: string]: number } = {};
  let totalPercentage = 0;

  POPULATIONS.forEach(pop => {
    const percentage = (expScores[pop] / totalExp) * 100;
    ancestry[pop] = percentage;
    totalPercentage += percentage;
  });

  // Ensure percentages sum to exactly 100% due to floating point precision
  if (Math.abs(totalPercentage - 100) > 0.01) {
    const adjustment = (100 - totalPercentage) / POPULATIONS.length;
    POPULATIONS.forEach(pop => {
      ancestry[pop] += adjustment;
    });
  }

  // Calculate confidence based on markers used
  const confidence = Math.min(100, (markersUsed / Object.keys(ANCESTRY_MARKERS).length) * 100);

  return {
    ancestry,
    confidence,
    markers_used: markersUsed,
    total_markers: Object.keys(ANCESTRY_MARKERS).length
  };
}

/**
 * Extract individual alleles from genotype string
 */
function extractAlleles(genotype: string): string[] {
  // Handle different genotype formats: AA, A/A, A;A, etc.
  const cleaned = genotype.replace(/[^ACGT]/g, '');
  return cleaned.split('');
}

/**
 * Get detailed marker information for a specific SNP
 */
export function getMarkerInfo(rsid: string): any {
  const marker = ANCESTRY_MARKERS[rsid];
  if (!marker) return null;

  return {
    rsid,
    populations: marker,
    description: getMarkerDescription(rsid)
  };
}

/**
 * Get human-readable description for ancestry markers
 */
function getMarkerDescription(rsid: string): string {
  const descriptions: { [key: string]: string } = {
    "rs1426654": "Skin pigmentation - European ancestry marker",
    "rs3827760": "Hair thickness - East Asian ancestry marker",
    "rs4988235": "Lactose tolerance - European ancestry marker",
    "rs12913832": "Eye color - European blue eyes marker",
    "rs2814778": "Malaria resistance - African ancestry marker",
    "rs1800407": "Skin and eye pigmentation marker",
    "rs17822931": "Earwax type - East Asian dry earwax marker",
    "rs1229984": "Alcohol metabolism - East Asian variant"
  };

  return descriptions[rsid] || "Ancestry-informative marker";
}
