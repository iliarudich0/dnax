"use client";

import { useEffect, useState } from "react";
import { UploadCloud, Trash2, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { uploadDNAToCloud } from "@/lib/cloud-upload";
import { getFirestoreDb } from "@/lib/firebase/client";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { firebaseEnabled } from "@/lib/env";

const ALLOWED_EXTENSIONS = [".txt", ".csv"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface DNAResult {
  id: string;
  fileName?: string;
  size?: number;
  fileSize?: number;
  uploadedAt?: string;
  status: string;
  ethnicity?: any;
  error?: string;
  totalSnps?: number;
  sampleSnps?: any[];
}

export default function CloudProcessingPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<DNAResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user || !user.id || !firebaseEnabled) return;

    const db = getFirestoreDb();
    if (!db) {
      console.error("Firestore not initialized");
      return;
    }

    console.log("Setting up real-time listener for user:", user.id);

    const resultsRef = collection(db, "users", user.id, "dna_results");
    const q = query(resultsRef, orderBy("uploadedAt", "desc"));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log("Received", snapshot.docs.length, "DNA results");
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          console.log("Result:", doc.id, "status:", docData.status);
          return {
            id: doc.id,
            ...docData,
          };
        }) as any[];
        setResults(data);
      },
      (error) => {
        console.error("Error listening to DNA results:", error);
        setError("Failed to load results: " + error.message);
      }
    );

    return () => {
      console.log("Cleaning up listener");
      unsubscribe();
    };
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 100MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!user || !user.id || !selectedFile || !firebaseEnabled) return;

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      console.log("Starting upload for user:", user.id);
      console.log("File:", selectedFile.name, "Size:", (selectedFile.size / 1024 / 1024).toFixed(2), "MB");
      
      const uploadId = await uploadDNAToCloud(selectedFile, user.id, (progress) => {
        console.log("Upload progress:", progress + "%");
        setUploadProgress(Math.round(progress));
      });

      console.log("Upload complete! ID:", uploadId);
      console.log("Cloud Function will process the file in 1-2 minutes.");
      console.log("Watch the Processing Results section below for status updates.");
      
      setSelectedFile(null);
      setUploadProgress(0);

      // Reset file input
      const fileInput = document.getElementById("dna-file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  if (!firebaseEnabled) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cloud processing is only available when Firebase is enabled. Currently running in mock mode.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please sign in to use cloud DNA processing.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cloud DNA Processing</CardTitle>
          <CardDescription>
            Upload your raw DNA file (23andMe, AncestryDNA, MyHeritage). Files are processed automatically and results
            appear below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Input
              id="dna-file-input"
              type="file"
              accept={ALLOWED_EXTENSIONS.join(",")}
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full">
            <UploadCloud className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload & Process"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Files are processed automatically by Cloud Functions. Results typically appear within 1-2 minutes.
          </p>

          {/* Debug Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1 text-xs">
                <p><strong>How it works:</strong></p>
                <p>1. File uploads to Firebase Storage at <code>users/{'{userId}'}/raw/{'{filename}'}</code></p>
                <p>2. Cloud Function automatically triggers and processes your DNA</p>
                <p>3. Results appear below with ethnicity estimates</p>
                <p className="mt-2"><strong>Tip:</strong> Open browser console (F12) to see detailed logs</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Processing Results</h2>
          <Badge variant="secondary">{results.length} file{results.length !== 1 ? 's' : ''}</Badge>
        </div>

        {results.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No DNA files uploaded yet</p>
              <p className="text-sm">Upload a file above to start processing</p>
            </CardContent>
          </Card>
        ) : (
          results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{result.fileName || "Unknown file"}</CardTitle>
                    <CardDescription>
                      File ID: {result.id} • {result.fileSize ? (result.fileSize / 1024 / 1024).toFixed(2) : "0"} MB
                    </CardDescription>
                  </div>
                  <StatusBadge status={result.status as "processing" | "completed" | "failed"} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.status === "processing" && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">⚙️ Processing your DNA file...</p>
                        <p className="text-sm">Cloud Function is analyzing your data. This typically takes 1-2 minutes.</p>
                        {result.uploadedAt && (
                          <p className="text-xs text-muted-foreground">
                            Started: {new Date(result.uploadedAt).toLocaleTimeString()} 
                            ({Math.round((Date.now() - new Date(result.uploadedAt).getTime()) / 1000)}s ago)
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-pulse" style={{ width: "70%" }} />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          💡 Check Firebase Console &gt; Functions logs if this takes longer than 3 minutes
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {result.status === "uploading" && (
                  <Alert>
                    <UploadCloud className="h-4 w-4 animate-pulse" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">📤 Uploading to Firebase Storage...</p>
                        <p className="text-sm">Your file is being uploaded and will be processed automatically.</p>
                        {result.uploadedAt && (
                          <p className="text-xs text-muted-foreground">
                            Started: {new Date(result.uploadedAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {result.status === "completed" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total SNPs:</span>
                        <p className="font-semibold">{result.totalSnps?.toLocaleString() || "0"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Processed:</span>
                        <p className="font-semibold">
                          {result.uploadedAt ? new Date(result.uploadedAt).toLocaleString() : "N/A"}
                        </p>
                      </div>
                    </div>

                    {result.sampleSnps && result.sampleSnps.length > 0 && (
                      <details className="text-sm">
                        <summary className="cursor-pointer font-semibold mb-2">
                          Sample SNPs (first {result.sampleSnps.length})
                        </summary>
                        <div className="bg-muted p-4 rounded-md overflow-auto max-h-64">
                          <table className="w-full text-xs font-mono">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-1">rsID</th>
                                <th className="text-left py-1">Chr</th>
                                <th className="text-left py-1">Position</th>
                                <th className="text-left py-1">Genotype</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.sampleSnps.map((snp, i) => (
                                <tr key={i} className="border-b border-border/50">
                                  <td className="py-1">{snp.rsid}</td>
                                  <td className="py-1">{snp.chromosome}</td>
                                  <td className="py-1">{snp.position}</td>
                                  <td className="py-1">{snp.genotype}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    )}
                  </div>
                )}

                {result.status === "failed" && result.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "processing" | "completed" | "failed" }) {
  switch (status) {
    case "processing":
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="default" className="gap-1 bg-green-600 text-white border-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
  }
}
