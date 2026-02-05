"use client";

import { useEffect, useState } from "react";
import { UploadCloud, Trash2, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { uploadDNAFile } from "@/lib/firebase/dna-storage";
import { onDNAProcessingResults, DNAProcessingResult } from "@/lib/firebase/dna-processing";
import { firebaseEnabled } from "@/lib/env";

const ALLOWED_EXTENSIONS = [".txt", ".csv"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function CloudProcessingPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<Array<DNAProcessingResult & { id: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user || !firebaseEnabled) return;

    const unsubscribe = onDNAProcessingResults(user.id, (data) => {
      setResults(data.sort((a, b) => {
        const aTime = a.processedAt || "";
        const bTime = b.processedAt || "";
        return bTime.localeCompare(aTime);
      }));
    });

    return () => unsubscribe();
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
    if (!user || !selectedFile || !firebaseEnabled) return;

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadDNAFile(user.id, selectedFile, (progress) => {
        setUploadProgress(Math.round(progress));
      });

      console.log("File uploaded successfully:", result);
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
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Processing Results</h2>

        {results.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No DNA files processed yet. Upload a file above to get started.</p>
            </CardContent>
          </Card>
        ) : (
          results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{result.fileName}</CardTitle>
                    <CardDescription>
                      File ID: {result.id} • {(result.fileSize / 1024 / 1024).toFixed(2)} MB
                    </CardDescription>
                  </div>
                  <StatusBadge status={result.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.status === "processing" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing file... This may take 1-2 minutes.</span>
                  </div>
                )}

                {result.status === "completed" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total SNPs:</span>
                        <p className="font-semibold">{result.totalSnps.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Processed:</span>
                        <p className="font-semibold">
                          {result.processedAt ? new Date(result.processedAt).toLocaleString() : "N/A"}
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
