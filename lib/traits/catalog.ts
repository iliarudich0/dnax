import { TraitCategory, TraitResult } from "@/lib/types";
import { normalizeGenotype } from "@/lib/parser";

export type TraitDefinition = {
  id: string;
  name: string;
  category: TraitCategory;
  description: string;
  snp: {
    rsid: string;
    gene: string;
  };
  interpret: (genotype: string) => Pick<TraitResult, "outcome" | "summary" | "confidence">;
  whatItMeans: string;
  whatYouCanDo: string[];
  limitations: string[];
  sources: { label: string; url: string }[];
};

const notDetected = {
  outcome: "Not detected",
  summary: "We did not find this SNP in your file.",
  confidence: "Low" as const,
};

export const traitCatalog: TraitDefinition[] = [
  {
    id: "lactose-tolerance",
    name: "Lactose Tolerance (LCT)",
    category: "Nutrition",
    description: "Proxy for lactose digestion in adulthood.",
    snp: { rsid: "rs4988235", gene: "LCT" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "TT" || g === "CT") {
        return {
          outcome: "Likely lactose tolerant",
          summary: "T-allele is associated with lactase persistence.",
          confidence: "Medium",
        };
      }
      if (g === "CC") {
        return {
          outcome: "Likely lower lactose tolerance",
          summary: "C-allele is associated with reduced lactase persistence.",
          confidence: "Medium",
        };
      }
      return notDetected;
    },
    whatItMeans:
      "This SNP is a proxy for the ability to digest lactose later in life. It is not a clinical diagnosis.",
    whatYouCanDo: [
      "If dairy causes discomfort, try lactose-free options.",
      "Track how you feel after dairy rather than relying on DNA alone.",
    ],
    limitations: [
      "Only one SNP is used; many factors influence tolerance.",
      "Population effects vary widely across ancestry groups.",
    ],
    sources: [
      { label: "SNPedia rs4988235", url: "https://www.snpedia.com/index.php/rs4988235" },
    ],
  },
  {
    id: "caffeine-metabolism",
    name: "Caffeine Metabolism (CYP1A2)",
    category: "Lifestyle",
    description: "Proxy for how quickly caffeine is metabolized.",
    snp: { rsid: "rs762551", gene: "CYP1A2" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "AA") {
        return { outcome: "Fast metabolizer", summary: "Caffeine clears relatively quickly.", confidence: "Medium" };
      }
      if (g === "AC") {
        return { outcome: "Intermediate metabolizer", summary: "Typical caffeine clearance.", confidence: "Medium" };
      }
      if (g === "CC") {
        return { outcome: "Slow metabolizer", summary: "Caffeine may linger longer.", confidence: "Medium" };
      }
      return notDetected;
    },
    whatItMeans: "This SNP is linked to caffeine metabolism speed, not caffeine sensitivity or health outcomes.",
    whatYouCanDo: [
      "Adjust caffeine timing based on sleep quality.",
      "If caffeine affects you strongly, reduce late-day intake.",
    ],
    limitations: ["Lifestyle, medications, and sleep patterns also affect caffeine response."],
    sources: [{ label: "SNPedia rs762551", url: "https://www.snpedia.com/index.php/rs762551" }],
  },
  {
    id: "alcohol-flush",
    name: "Alcohol Flush Proxy (ALDH2)",
    category: "Lifestyle",
    description: "Proxy for acetaldehyde clearance after alcohol.",
    snp: { rsid: "rs671", gene: "ALDH2" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "GG") {
        return { outcome: "Typical flush response", summary: "Common ALDH2 activity.", confidence: "Medium" };
      }
      if (g === "AG" || g === "AA") {
        return {
          outcome: "Higher flush likelihood",
          summary: "Variant associated with reduced ALDH2 activity.",
          confidence: "Medium",
        };
      }
      return notDetected;
    },
    whatItMeans: "This SNP is a proxy and is most studied in East Asian populations.",
    whatYouCanDo: [
      "If you flush, consider lower alcohol intake.",
      "Pay attention to how your body reacts regardless of genotype.",
    ],
    limitations: ["Not predictive for all populations.", "Not a medical recommendation."],
    sources: [{ label: "SNPedia rs671", url: "https://www.snpedia.com/index.php/rs671" }],
  },
  {
    id: "bitter-taste",
    name: "Bitter Taste Sensitivity (TAS2R38)",
    category: "Nutrition",
    description: "Proxy for bitterness perception (PROP/PTC).",
    snp: { rsid: "rs713598", gene: "TAS2R38" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "CC") {
        return { outcome: "High bitter sensitivity", summary: "Likely stronger perception of bitterness.", confidence: "Low" };
      }
      if (g === "CG") {
        return { outcome: "Medium bitter sensitivity", summary: "Mixed bitter sensitivity.", confidence: "Low" };
      }
      if (g === "GG") {
        return { outcome: "Lower bitter sensitivity", summary: "Likely less sensitive to bitterness.", confidence: "Low" };
      }
      return notDetected;
    },
    whatItMeans: "Bitter taste sensitivity can influence food preferences, especially greens.",
    whatYouCanDo: [
      "Balance bitter foods with acids or healthy fats if they taste harsh.",
      "Experiment with preparation methods to find what works for you.",
    ],
    limitations: ["Taste is influenced by multiple SNPs and environment."],
    sources: [{ label: "SNPedia rs713598", url: "https://www.snpedia.com/index.php/rs713598" }],
  },
  {
    id: "earwax-type",
    name: "Earwax Type (ABCC11)",
    category: "Appearance",
    description: "Proxy for wet vs dry earwax.",
    snp: { rsid: "rs17822931", gene: "ABCC11" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "AA") {
        return { outcome: "Likely dry earwax", summary: "A-allele associated with dry earwax.", confidence: "High" };
      }
      if (g === "AG" || g === "GG") {
        return { outcome: "Likely wet earwax", summary: "G-allele associated with wet earwax.", confidence: "High" };
      }
      return notDetected;
    },
    whatItMeans: "This SNP is strongly associated with earwax type.",
    whatYouCanDo: ["No action needed ? just a fun trait to know."],
    limitations: ["Very strong association, but rare exceptions exist."],
    sources: [{ label: "SNPedia rs17822931", url: "https://www.snpedia.com/index.php/rs17822931" }],
  },
  {
    id: "muscle-performance",
    name: "Muscle Performance (ACTN3)",
    category: "Physical",
    description: "Proxy for sprint vs endurance performance.",
    snp: { rsid: "rs1815739", gene: "ACTN3" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "CC") {
        return { outcome: "Power-oriented", summary: "Associated with fast-twitch muscle fibers.", confidence: "Low" };
      }
      if (g === "CT") {
        return { outcome: "Balanced", summary: "Mix of sprint and endurance traits.", confidence: "Low" };
      }
      if (g === "TT") {
        return { outcome: "Endurance-oriented", summary: "Associated with slower-twitch fibers.", confidence: "Low" };
      }
      return notDetected;
    },
    whatItMeans: "This SNP is one of many factors contributing to athletic performance.",
    whatYouCanDo: ["Use it as a curiosity, not as training advice."],
    limitations: ["Training and environment dominate athletic outcomes."],
    sources: [{ label: "SNPedia rs1815739", url: "https://www.snpedia.com/index.php/rs1815739" }],
  },
  {
    id: "eye-color",
    name: "Eye Color Proxy (HERC2)",
    category: "Appearance",
    description: "Proxy for lighter vs darker eye color.",
    snp: { rsid: "rs12913832", gene: "HERC2" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "AA") {
        return { outcome: "Lighter eyes", summary: "Associated with blue/green eyes.", confidence: "Medium" };
      }
      if (g === "AG") {
        return { outcome: "Mixed", summary: "Can be hazel or intermediate shades.", confidence: "Medium" };
      }
      if (g === "GG") {
        return { outcome: "Darker eyes", summary: "Associated with brown eyes.", confidence: "Medium" };
      }
      return notDetected;
    },
    whatItMeans: "Eye color is polygenic; this SNP is a strong contributor but not definitive.",
    whatYouCanDo: ["No action needed ? just a genetics curiosity."],
    limitations: ["Multiple SNPs influence final eye color."],
    sources: [{ label: "SNPedia rs12913832", url: "https://www.snpedia.com/index.php/rs12913832" }],
  },
  {
    id: "hair-thickness",
    name: "Hair Thickness Proxy (EDAR)",
    category: "Appearance",
    description: "Proxy for thicker hair shafts.",
    snp: { rsid: "rs3827760", gene: "EDAR" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "AA") {
        return { outcome: "Thicker hair tendency", summary: "Associated with thicker hair shafts.", confidence: "Low" };
      }
      if (g === "AG") {
        return { outcome: "Moderate thickness", summary: "Mixed association.", confidence: "Low" };
      }
      if (g === "GG") {
        return { outcome: "Typical thickness", summary: "Common thickness range.", confidence: "Low" };
      }
      return notDetected;
    },
    whatItMeans: "Hair thickness is influenced by several genes and environment.",
    whatYouCanDo: ["Hair care routines can affect perceived thickness."],
    limitations: ["Effect sizes are modest and population-specific."],
    sources: [{ label: "SNPedia rs3827760", url: "https://www.snpedia.com/index.php/rs3827760" }],
  },
  {
    id: "omega3-proxy",
    name: "Omega-3 Conversion Proxy (FADS1)",
    category: "Nutrition",
    description: "Proxy for conversion of plant omega-3 to longer-chain forms.",
    snp: { rsid: "rs174546", gene: "FADS1" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "CC") {
        return { outcome: "Higher conversion", summary: "Associated with higher conversion efficiency.", confidence: "Low" };
      }
      if (g === "CT") {
        return { outcome: "Moderate conversion", summary: "Intermediate conversion efficiency.", confidence: "Low" };
      }
      if (g === "TT") {
        return { outcome: "Lower conversion", summary: "Associated with lower conversion efficiency.", confidence: "Low" };
      }
      return notDetected;
    },
    whatItMeans: "This is a nutritional proxy, not a health diagnosis.",
    whatYouCanDo: ["Include omega-3 sources you tolerate well."],
    limitations: ["Diet dominates omega-3 levels; genetics is only one factor."],
    sources: [{ label: "SNPedia rs174546", url: "https://www.snpedia.com/index.php/rs174546" }],
  },
  {
    id: "cilantro-taste",
    name: "Cilantro Taste (OR6A2)",
    category: "Nutrition",
    description: "Proxy for cilantro aversion (soapy taste).",
    snp: { rsid: "rs72921001", gene: "OR6A2" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "AA") {
        return { outcome: "Higher aversion", summary: "More likely to perceive a soapy taste.", confidence: "Low" };
      }
      if (g === "AG") {
        return { outcome: "Mixed response", summary: "Neutral or mixed cilantro preference.", confidence: "Low" };
      }
      if (g === "GG") {
        return { outcome: "Likely enjoys cilantro", summary: "Lower aversion to cilantro taste.", confidence: "Low" };
      }
      return notDetected;
    },
    whatItMeans: "This SNP is linked to aroma perception; preference still varies widely.",
    whatYouCanDo: ["Choose herbs you enjoy ? taste is personal."],
    limitations: ["Single SNP, small effect size."],
    sources: [{ label: "SNPedia rs72921001", url: "https://www.snpedia.com/index.php/rs72921001" }],
  },
  {
    id: "sweet-preference",
    name: "Sweet Preference (TAS1R2)",
    category: "Nutrition",
    description: "Proxy for sweet taste preference.",
    snp: { rsid: "rs35874116", gene: "TAS1R2" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "TT") {
        return { outcome: "Higher sweet preference", summary: "Associated with stronger sweet preference.", confidence: "Low" };
      }
      if (g === "CT") {
        return { outcome: "Moderate sweet preference", summary: "Typical sweet preference.", confidence: "Low" };
      }
      if (g === "CC") {
        return { outcome: "Lower sweet preference", summary: "Associated with lower sweet preference.", confidence: "Low" };
      }
      return notDetected;
    },
    whatItMeans: "This is a taste preference proxy; habits and culture play a large role.",
    whatYouCanDo: ["Use mindful eating habits regardless of genotype."],
    limitations: ["Taste preference is polygenic and environment-dependent."],
    sources: [{ label: "SNPedia rs35874116", url: "https://www.snpedia.com/index.php/rs35874116" }],
  },
  {
    id: "hair-curl",
    name: "Hair Curliness Proxy (TCHH)",
    category: "Appearance",
    description: "Proxy for hair curliness.",
    snp: { rsid: "rs11803731", gene: "TCHH" },
    interpret: (genotype) => {
      const g = normalizeGenotype(genotype);
      if (g === "TT") {
        return { outcome: "Curlier hair tendency", summary: "Associated with curlier hair texture.", confidence: "Low" };
      }
      if (g === "CT") {
        return { outcome: "Wavy tendency", summary: "Mixed hair texture traits.", confidence: "Low" };
      }
      if (g === "CC") {
        return { outcome: "Straighter tendency", summary: "Associated with straighter hair.", confidence: "Low" };
      }
      return notDetected;
    },
    whatItMeans: "Hair texture is influenced by multiple genes and environment.",
    whatYouCanDo: ["Care routines can influence visible texture."],
    limitations: ["Single SNP proxy only."],
    sources: [{ label: "SNPedia rs11803731", url: "https://www.snpedia.com/index.php/rs11803731" }],
  },
];

export function evaluateTraits(genotypeMap: Record<string, string>): TraitResult[] {
  return traitCatalog.map((trait) => {
    const genotype = genotypeMap[trait.snp.rsid] ?? "";
    const interpretation = trait.interpret(genotype);
    return {
      traitId: trait.id,
      name: trait.name,
      category: trait.category,
      genotype: normalizeGenotype(genotype),
      outcome: interpretation.outcome,
      summary: interpretation.summary,
      confidence: interpretation.confidence,
      whatItMeans: trait.whatItMeans,
      whatYouCanDo: trait.whatYouCanDo,
      limitations: trait.limitations,
      sources: trait.sources,
    };
  });
}

export const traitSnpIds = traitCatalog.map((trait) => trait.snp.rsid);
