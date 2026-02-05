"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerDNAProcessing = exports.processDNAFile = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const storage_1 = require("@google-cloud/storage");
const readline = __importStar(require("readline"));
const ethnicity_calculator_1 = require("./ethnicity-calculator");
admin.initializeApp();
const db = admin.firestore();
const storage = new storage_1.Storage();
/**
 * Cloud Function triggered when a DNA file is uploaded to Storage
 * Path: users/{userId}/raw/{fileName}
 */
exports.processDNAFile = functions.storage.onObjectFinalized({
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540,
}, async (event) => {
    var _a, e_1, _b, _c;
    const filePath = event.data.name;
    const bucketName = event.data.bucket;
    // Parse the file path to extract userId and fileId
    const pathParts = filePath.split("/");
    if (pathParts.length < 4 || pathParts[0] !== "users" || pathParts[2] !== "raw") {
        functions.logger.info("Ignoring file not in users/{userId}/raw/ path", { filePath });
        return;
    }
    const userId = pathParts[1];
    const fileName = pathParts[pathParts.length - 1];
    const fileId = fileName.split(".")[0]; // Use filename without extension as ID
    functions.logger.info("Processing DNA file", { userId, fileName, fileId, filePath });
    // Reference to the existing document (created by upload)
    const resultRef = db.collection("users").doc(userId).collection("dna_results").doc(fileId);
    try {
        // Update status to processing (don't overwrite, merge with existing data)
        await resultRef.set({
            status: "processing",
            uploadPath: filePath,
        }, { merge: true });
        // Stream and parse the file
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(filePath);
        const [metadata] = await file.getMetadata();
        const fileSize = parseInt(String(metadata.size || "0"), 10);
        const readStream = file.createReadStream();
        const rl = readline.createInterface({
            input: readStream,
            crlfDelay: Infinity,
        });
        const snps = [];
        let totalSnps = 0;
        let lineCount = 0;
        const maxSampleSnps = 1000; // Store more SNPs for better ethnicity calculation
        let isCSV = fileName.toLowerCase().endsWith(".csv");
        try {
            for (var _d = true, rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = await rl_1.next(), _a = rl_1_1.done, !_a; _d = true) {
                _c = rl_1_1.value;
                _d = false;
                const line = _c;
                lineCount++;
                // Skip comment lines and empty lines
                if (line.startsWith("#") || line.trim() === "" || line.startsWith("RSID") || line.startsWith("rsid")) {
                    // Check if CSV on first data line
                    if (lineCount < 10 && line.includes(",")) {
                        isCSV = true;
                    }
                    continue;
                }
                // Log first few lines for debugging
                if (lineCount <= 5) {
                    functions.logger.info(`Line ${lineCount}: "${line}"`);
                }
                // Parse SNP line - support both CSV and space-delimited
                // CSV format: RSID,CHROMOSOME,POSITION,RESULT
                // Space format: rsid chromosome position genotype
                const parts = isCSV ? line.trim().split(",") : line.trim().split(/\s+/);
                if (parts.length >= 4) {
                    const snp = {
                        rsid: parts[0].trim(),
                        chromosome: parts[1].trim(),
                        position: parts[2].trim(),
                        genotype: parts[3].trim(),
                    };
                    // Only count if it looks like a valid SNP
                    if (snp.rsid.startsWith("rs") || snp.rsid.startsWith("i")) {
                        totalSnps++;
                        // Store only first 100 SNPs as sample
                        if (snps.length < maxSampleSnps) {
                            snps.push(snp);
                        }
                    }
                }
                // Log progress every 10000 lines
                if (lineCount % 10000 === 0) {
                    functions.logger.info(`Processed ${lineCount} lines, ${totalSnps} SNPs found`);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = rl_1.return)) await _b.call(rl_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        functions.logger.info(`File parsing completed: ${totalSnps} SNPs found, ${snps.length} stored`);
        if (totalSnps === 0) {
            functions.logger.warn("No SNPs found in file. File format may be incorrect.");
        }
        // Calculate ethnicity from SNPs
        functions.logger.info("Calculating ethnicity from SNPs", { totalSnps, sampleSize: snps.length });
        const ethnicityResult = (0, ethnicity_calculator_1.calculateEthnicity)(snps);
        functions.logger.info("Ethnicity calculation completed", {
            ancestry: ethnicityResult.ancestry,
            confidence: ethnicityResult.confidence,
            markersUsed: ethnicityResult.markers_used
        });
        // Save results to Firestore (merge with existing data)
        await resultRef.set({
            status: "completed",
            totalSnps,
            sampleSnps: snps.slice(0, 100), // Store first 100 for display
            processedAt: new Date().toISOString(),
            fileSize,
            ethnicity: ethnicityResult,
        }, { merge: true });
        functions.logger.info("DNA file processing completed", {
            userId,
            fileId,
            totalSnps,
            sampleSize: snps.length,
        });
        return { success: true, totalSnps, sampleSize: snps.length };
    }
    catch (error) {
        functions.logger.error("Error processing DNA file", error);
        await resultRef.set({
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
            processedAt: new Date().toISOString(),
        }, { merge: true });
        throw error;
    }
});
/**
 * Callable function to manually trigger DNA file processing
 * Useful for testing or reprocessing files
 */
exports.triggerDNAProcessing = functions.https.onCall({
    region: "us-central1",
}, async (request) => {
    const { userId, fileName } = request.data;
    if (!request.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    if (request.auth.uid !== userId) {
        throw new functions.https.HttpsError("permission-denied", "Cannot process files for other users");
    }
    if (!fileName) {
        throw new functions.https.HttpsError("invalid-argument", "fileName is required");
    }
    functions.logger.info("Manual trigger for DNA processing", { userId, fileName });
    // Trigger processing by creating a marker document
    const fileId = fileName.split(".")[0];
    const resultRef = db.collection("users").doc(userId).collection("dna_results").doc(fileId);
    await resultRef.set({
        status: "processing",
        fileName,
        uploadPath: `users/${userId}/raw/${fileName}`,
        triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, fileId };
});
//# sourceMappingURL=index.js.map