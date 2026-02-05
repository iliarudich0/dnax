"use strict";
/**
 * GEDmatch-Style Ancestry Calculators
 * Multiple calculator models for comprehensive ethnicity estimation
 *
 * Based on open-source genetic research and publicly available population data
 * Similar to GEDmatch Eurogenes, Dodecad, HarappaWorld calculators
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.POPULATION_FREQUENCIES = exports.COMPREHENSIVE_AIMS = void 0;
exports.calculateEurogenes = calculateEurogenes;
exports.calculateAncestry = calculateAncestry;
const MIN_MARKERS_FOR_ESTIMATE = 3;
/**
 * Comprehensive list of ancestry-informative markers (AIMs)
 * Expanded from research papers and commercial DNA testing
 */
exports.COMPREHENSIVE_AIMS = {
    // Skin pigmentation markers
    "rs1426654": { gene: "SLC24A5", trait: "European skin lightening" },
    "rs1800407": { gene: "OCA2", trait: "Eye/skin color" },
    "rs16891982": { gene: "SLC45A2", trait: "European skin pigmentation" },
    "rs1393350": { gene: "TYR", trait: "Skin pigmentation" },
    // Eye color markers
    "rs12913832": { gene: "HERC2", trait: "Blue eyes (European)" },
    "rs1800401": { gene: "OCA2", trait: "Eye color variation" },
    // Hair markers
    "rs3827760": { gene: "EDAR", trait: "East Asian hair thickness / Shovel-shaped incisors" },
    "rs11803731": { gene: "TCHH", trait: "Hair texture" },
    // Lactose tolerance
    "rs4988235": { gene: "LCT", trait: "Lactose tolerance (European)" },
    "rs182549": { gene: "LCT", trait: "Lactose tolerance (African)" },
    // African markers
    "rs2814778": { gene: "DARC", trait: "African malaria resistance" },
    "rs334": { gene: "HBB", trait: "Sickle cell (African)" },
    // East Asian markers
    "rs17822931": { gene: "ABCC11", trait: "Dry earwax (East Asian)" },
    "rs1229984": { gene: "ADH1B", trait: "Alcohol metabolism (Asian)" },
    // Jewish/Middle Eastern markers
    "rs7903146": { gene: "TCF7L2", trait: "Type 2 diabetes risk" },
    // Common SNPs in MyHeritage/23andMe files
    "rs3131972": { trait: "Common variant" },
    "rs12184325": { trait: "Common variant" },
    "rs11240777": { trait: "Common variant" },
    "rs79373928": { trait: "Common variant" },
    "rs4970383": { trait: "Common variant" },
    "rs7537756": { trait: "Common variant" },
    "rs2340592": { trait: "Common variant" },
    "rs2341354": { trait: "Common variant" },
    "rs9442372": { trait: "Common variant" },
    "rs4072537": { trait: "Common variant" },
    "rs1891905": { trait: "Common variant" },
};
/**
 * Population frequency data for major ancestry groups
 * Simplified model based on 1000 Genomes and HapMap data
 */
exports.POPULATION_FREQUENCIES = {
    "rs1426654": {
        "European": { "A": 0.99, "G": 0.01 },
        "Ashkenazi_Jewish": { "A": 0.98, "G": 0.02 },
        "Middle_Eastern": { "A": 0.85, "G": 0.15 },
        "African": { "A": 0.02, "G": 0.98 },
        "East_Asian": { "A": 0.97, "G": 0.03 },
        "South_Asian": { "A": 0.65, "G": 0.35 },
        "Native_American": { "A": 0.95, "G": 0.05 },
    },
    "rs12913832": {
        "European": { "A": 0.28, "G": 0.72 },
        "Ashkenazi_Jewish": { "A": 0.35, "G": 0.65 },
        "Middle_Eastern": { "A": 0.82, "G": 0.18 },
        "African": { "A": 0.95, "G": 0.05 },
        "East_Asian": { "A": 0.98, "G": 0.02 },
        "South_Asian": { "A": 0.88, "G": 0.12 },
        "Native_American": { "A": 0.92, "G": 0.08 },
    },
    "rs3827760": {
        "European": { "A": 0.92, "G": 0.08 },
        "Ashkenazi_Jewish": { "A": 0.90, "G": 0.10 },
        "Middle_Eastern": { "A": 0.88, "G": 0.12 },
        "African": { "A": 0.98, "G": 0.02 },
        "East_Asian": { "A": 0.15, "G": 0.85 },
        "South_Asian": { "A": 0.75, "G": 0.25 },
        "Native_American": { "A": 0.35, "G": 0.65 },
    },
    "rs4988235": {
        "European": { "T": 0.52, "C": 0.48 },
        "Ashkenazi_Jewish": { "T": 0.62, "C": 0.38 },
        "Middle_Eastern": { "T": 0.42, "C": 0.58 },
        "African": { "T": 0.08, "C": 0.92 },
        "East_Asian": { "T": 0.02, "C": 0.98 },
        "South_Asian": { "T": 0.28, "C": 0.72 },
        "Native_American": { "T": 0.05, "C": 0.95 },
    },
    "rs2814778": {
        "European": { "T": 0.98, "C": 0.02 },
        "Ashkenazi_Jewish": { "T": 0.97, "C": 0.03 },
        "Middle_Eastern": { "T": 0.88, "C": 0.12 },
        "African": { "T": 0.02, "C": 0.98 },
        "East_Asian": { "T": 0.95, "C": 0.05 },
        "South_Asian": { "T": 0.85, "C": 0.15 },
        "Native_American": { "T": 0.92, "C": 0.08 },
    },
    "rs17822931": {
        "European": { "C": 0.45, "T": 0.55 },
        "Ashkenazi_Jewish": { "C": 0.42, "T": 0.58 },
        "Middle_Eastern": { "C": 0.38, "T": 0.62 },
        "African": { "C": 0.08, "T": 0.92 },
        "East_Asian": { "C": 0.05, "T": 0.95 },
        "South_Asian": { "C": 0.32, "T": 0.68 },
        "Native_American": { "C": 0.12, "T": 0.88 },
    },
    "rs1229984": {
        "European": { "T": 0.95, "C": 0.05 },
        "Ashkenazi_Jewish": { "T": 0.93, "C": 0.07 },
        "Middle_Eastern": { "T": 0.88, "C": 0.12 },
        "African": { "T": 0.98, "C": 0.02 },
        "East_Asian": { "T": 0.25, "C": 0.75 },
        "South_Asian": { "T": 0.72, "C": 0.28 },
        "Native_American": { "T": 0.85, "C": 0.15 },
    },
};
/**
 * Eurogenes-style calculator (European focus)
 */
function calculateEurogenes(snps) {
    const populations = {
        "North_European": 0,
        "South_European": 0,
        "West_Asian": 0,
        "Ashkenazi": 0,
        "East_Med": 0,
        "Siberian": 0,
        "Sub_Saharan": 0,
    };
    // Simplified calculation - in production, this would use PCA algorithms
    let markersUsed = 0;
    const totalMarkers = Object.keys(exports.COMPREHENSIVE_AIMS).length;
    // Basic ancestry inference from available SNPs
    for (const snp of snps) {
        if (exports.POPULATION_FREQUENCIES[snp.rsid]) {
            markersUsed++;
            // Add sophisticated calculation logic here
        }
    }
    // For now, provide placeholder that shows the calculator is available
    return {
        name: "Eurogenes K13",
        populations,
        confidence: 0,
        markers_used: markersUsed,
        total_markers: totalMarkers,
        description: "European-focused ancestry calculator"
    };
}
/**
 * Main calculator with Jewish/Ashkenazi detection
 */
function calculateAncestry(snps) {
    const snpMap = new Map(snps.map(s => [s.rsid, s]));
    const populations = {
        "European": 0,
        "Ashkenazi_Jewish": 0,
        "Middle_Eastern": 0,
        "African": 0,
        "East_Asian": 0,
        "South_Asian": 0,
        "Native_American": 0,
    };
    let markersUsed = 0;
    const scores = {};
    for (const pop of Object.keys(populations)) {
        scores[pop] = 0;
    }
    //calculate likelihood for each population based on genotypes
    for (const [rsid, freqs] of Object.entries(exports.POPULATION_FREQUENCIES)) {
        const snp = snpMap.get(rsid);
        if (!snp)
            continue;
        markersUsed++;
        const genotype = snp.genotype.toUpperCase();
        // Handle diploid genotypes
        const alleles = genotype.split('');
        for (const pop of Object.keys(populations)) {
            const popFreqs = freqs[pop];
            if (!popFreqs)
                continue;
            let likelihood = 1.0;
            for (const allele of alleles) {
                const freq = popFreqs[allele] || 0.01; // Small frequency for missing alleles
                likelihood *= freq;
            }
            scores[pop] += Math.log(likelihood + 0.0001);
        }
    }
    // Convert log-likelihoods to percentages
    if (markersUsed < MIN_MARKERS_FOR_ESTIMATE) {
        return {
            name: "Comprehensive Ancestry",
            populations,
            confidence: 0,
            markers_used: markersUsed,
            total_markers: Object.keys(exports.POPULATION_FREQUENCIES).length,
            description: "Multi-population ancestry calculator including Jewish ancestry detection",
            warning: "Insufficient ancestry markers in file to generate a reliable estimate.",
            insufficient_markers: true,
        };
    }
    let maxScore = Math.max(...Object.values(scores));
    let totalExp = 0;
    for (const pop of Object.keys(populations)) {
        const expScore = Math.exp(scores[pop] - maxScore);
        populations[pop] = expScore;
        totalExp += expScore;
    }
    // Normalize to percentages
    if (totalExp > 0) {
        for (const pop of Object.keys(populations)) {
            populations[pop] = (populations[pop] / totalExp) * 100;
        }
    }
    // Calculate confidence
    const topValue = Math.max(...Object.values(populations));
    const secondValue = Object.values(populations).sort((a, b) => b - a)[1] || 0;
    const confidence = markersUsed > 0 ? Math.min(100, (markersUsed / 7) * (topValue - secondValue)) : 0;
    return {
        name: "Comprehensive Ancestry",
        populations,
        confidence,
        markers_used: markersUsed,
        total_markers: Object.keys(exports.POPULATION_FREQUENCIES).length,
        description: "Multi-population ancestry calculator including Jewish ancestry detection"
    };
}
//# sourceMappingURL=gedmatch-style.js.map