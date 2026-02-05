import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import {Storage} from "@google-cloud/storage";
import {Readable} from "stream";
import * as readline from "readline";
import {calculateEthnicity} from "./ethnicity-calculator";

admin.initializeApp();

const db = admin.firestore();
const storage = new Storage();

interface SNPRecord {
  rsid: string;
  chromosome: string;
  position: string;
  genotype: string;
}

/**
 * Cloud Function triggered when a DNA file is uploaded to Storage
 * Path: users/{userId}/raw/{fileName}
 */
export const processDNAFile = functions.storage.onObjectFinalized({
  region: "us-central1",
  memory: "512MiB",
  timeoutSeconds: 540,
}, async (event) => {
  const filePath = event.data.name;
  const bucketName = event.data.bucket;

  // Parse the file path to extract userId and fileId
  const pathParts = filePath.split("/");
  if (pathParts.length < 4 || pathParts[0] !== "users" || pathParts[2] !== "raw") {
    functions.logger.info("Ignoring file not in users/{userId}/raw/ path", {filePath});
    return;
  }

  const userId = pathParts[1];
  const fileName = pathParts[pathParts.length - 1];
  const fileId = fileName.split(".")[0]; // Use filename without extension as ID

  functions.logger.info("Processing DNA file", {userId, fileName, fileId, filePath});

  // Reference to the existing document (created by upload)
  const resultRef = db.collection("users").doc(userId).collection("dna_results").doc(fileId);

  try {
    // Update status to processing (don't overwrite, merge with existing data)
    await resultRef.set({
      status: "processing",
      uploadPath: filePath,
    }, {merge: true});

    // Stream and parse the file
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    const [metadata] = await file.getMetadata();
    const fileSize = parseInt(String(metadata.size || "0"), 10);

    const readStream = file.createReadStream();
    const rl = readline.createInterface({
      input: readStream as Readable,
      crlfDelay: Infinity,
    });

    const snps: SNPRecord[] = [];
    let totalSnps = 0;
    let lineCount = 0;
    const maxSampleSnps = 1000; // Store more SNPs for better ethnicity calculation
    let isCSV = fileName.toLowerCase().endsWith(".csv");
    let headerSkipped = false;

    for await (const line of rl) {
      lineCount++;

      // Trim the line
      const trimmedLine = line.trim();

      // Skip empty lines
      if (trimmedLine === "") {
        continue;
      }

      // Skip comment lines
      if (trimmedLine.startsWith("#") || trimmedLine.startsWith("//")) {
        continue;
      }

      // Auto-detect CSV format
      if (lineCount < 10 && trimmedLine.includes(",") && !trimmedLine.includes("\t")) {
        isCSV = true;
      }

      // Skip header line (first non-comment line that contains column names)
      if (!headerSkipped && (
        trimmedLine.match(/^(RSID|rsid|SNP)/i) ||
        trimmedLine.match(/chromosome/i) ||
        trimmedLine.match(/position/i)
      )) {
        headerSkipped = true;
        functions.logger.info(`Skipping header: "${trimmedLine}"`);
        continue;
      }

      // Log first few data lines for debugging
      if (lineCount <= 10) {
        functions.logger.info(`Line ${lineCount} (CSV=${isCSV}): "${trimmedLine.substring(0, 100)}"`);
      }

      // Parse SNP line - support both CSV and tab/space-delimited
      // CSV format: RSID,CHROMOSOME,POSITION,RESULT
      // Tab format: rsid\tchromosome\tposition\tgenotype
      // Space format: rsid chromosome position genotype
      let parts: string[];
      if (isCSV) {
        // Handle CSV with possible quotes
        parts = trimmedLine.split(",").map(p => p.replace(/^["']|["']$/g, "").trim());
      } else if (trimmedLine.includes("\t")) {
        parts = trimmedLine.split("\t").map(p => p.trim());
      } else {
        parts = trimmedLine.split(/\s+/);
      }

      // Need at least 4 columns: rsid, chromosome, position, genotype
      if (parts.length >= 4) {
        const rsid = parts[0].trim();
        const chromosome = parts[1].trim();
        const position = parts[2].trim();
        const genotype = parts[3].trim();

        // Only count if it looks like a valid SNP (rsid starts with rs or i)
        // and chromosome is numeric or X/Y/MT
        if ((rsid.startsWith("rs") || rsid.startsWith("i")) && 
            (chromosome.match(/^(\d+|X|Y|MT|M)$/i) || chromosome.match(/^\d+$/)) &&
            position.match(/^\d+$/) &&
            genotype.match(/^[ACGT-]{1,2}$/i)) {
          
          const snp: SNPRecord = {
            rsid,
            chromosome,
            position,
            genotype: genotype.toUpperCase(),
          };

          totalSnps++;

          // Store first N SNPs for ethnicity calculation
          if (snps.length < maxSampleSnps) {
            snps.push(snp);
          }
        }
      }

      // Log progress every 50000 lines for large files
      if (lineCount % 50000 === 0) {
        functions.logger.info(`Processed ${lineCount} lines, ${totalSnps} SNPs found`);
      }
    }

    functions.logger.info(`File parsing completed: ${totalSnps} SNPs found, ${snps.length} stored`);
    
    if (totalSnps === 0) {
      functions.logger.warn("No SNPs found in file. File format may be incorrect.");
    }

    // Calculate ethnicity from SNPs
    functions.logger.info("Calculating ethnicity from SNPs", {totalSnps, sampleSize: snps.length});
    const ethnicityResult = calculateEthnicity(snps);
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
    }, {merge: true});

    functions.logger.info("DNA file processing completed", {
      userId,
      fileId,
      totalSnps,
      sampleSize: snps.length,
    });

    return {success: true, totalSnps, sampleSize: snps.length};
  } catch (error) {
    functions.logger.error("Error processing DNA file", error);

    await resultRef.set({
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      processedAt: new Date().toISOString(),
    }, {merge: true});

    throw error;
  }
});

/**
 * Callable function to manually trigger DNA file processing
 * Useful for testing or reprocessing files
 */
export const triggerDNAProcessing = functions.https.onCall({
  region: "us-central1",
}, async (request) => {
  const {userId, fileName} = request.data;

  if (!request.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  if (request.auth.uid !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Cannot process files for other users");
  }

  if (!fileName) {
    throw new functions.https.HttpsError("invalid-argument", "fileName is required");
  }

  functions.logger.info("Manual trigger for DNA processing", {userId, fileName});

  // Trigger processing by creating a marker document
  const fileId = fileName.split(".")[0];
  const resultRef = db.collection("users").doc(userId).collection("dna_results").doc(fileId);

  await resultRef.set({
    status: "processing",
    fileName,
    uploadPath: `users/${userId}/raw/${fileName}`,
    triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {success: true, fileId};
});
