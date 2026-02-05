"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Users, Image, AlertCircle, CheckCircle } from "lucide-react";
import { uploadGEDCOMFile } from "@/lib/firebase/gedcom-storage";

interface GEDCOMUpload {
  id: string;
  fileName: string;
  status: "uploading" | "processing" | "completed" | "failed";
  progress: number;
  size: number;
  uploadedAt: string;
  error?: string;
}

export default function GEDCOMPage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<GEDCOMUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.ged')) {
        setError(`File ${file.name} is not a GEDCOM file (.ged)`);
        continue;
      }

      const uploadId = `gedcom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const upload: GEDCOMUpload = {
        id: uploadId,
        fileName: file.name,
        status: "uploading",
        progress: 0,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      setUploads(prev => [upload, ...prev]);

      try {
        await uploadGEDCOMFile(file, uploadId, (progress) => {
          setUploads(prev => prev.map(u =>
            u.id === uploadId ? { ...u, progress, status: progress === 100 ? "processing" : "uploading" } : u
          ));
        });

        setUploads(prev => prev.map(u =>
          u.id === uploadId ? { ...u, status: "completed" } : u
        ));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setUploads(prev => prev.map(u =>
          u.id === uploadId ? { ...u, status: "failed", error: errorMessage } : u
        ));
        setError(errorMessage);
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <FileText className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Upload className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please sign in to upload GEDCOM files.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">GEDCOM Upload</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload your genealogical data in GEDCOM format (.ged files). GEDCOM files contain family tree information,
          relationships, and can include references to photos and documents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload GEDCOM Files
          </CardTitle>
          <CardDescription>
            Select one or more GEDCOM files (.ged) to upload. Files are stored securely and privately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <Label htmlFor="gedcom-upload" className="text-lg font-medium cursor-pointer">
                Choose GEDCOM files
              </Label>
              <p className="text-sm text-muted-foreground">
                or drag and drop .ged files here
              </p>
              <Input
                id="gedcom-upload"
                type="file"
                accept=".ged"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                ref={fileInputRef}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4"
            >
              {uploading ? "Uploading..." : "Select Files"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Supported format:</strong> GEDCOM 5.5 (.ged files)</p>
            <p><strong>Maximum file size:</strong> 100MB per file</p>
            <p><strong>Privacy:</strong> Files are encrypted and only accessible by you</p>
          </div>
        </CardContent>
      </Card>

      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload History</CardTitle>
            <CardDescription>Your recent GEDCOM file uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div key={upload.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(upload.status)}
                      <div>
                        <p className="font-medium">{upload.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(upload.size)} • {new Date(upload.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(upload.status)}>
                      {upload.status}
                    </Badge>
                  </div>

                  {upload.status === "uploading" && (
                    <div className="space-y-2">
                      <Progress value={upload.progress} className="w-full" />
                      <p className="text-sm text-muted-foreground text-center">
                        {upload.progress}% uploaded
                      </p>
                    </div>
                  )}

                  {upload.status === "processing" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Processing GEDCOM data...
                    </div>
                  )}

                  {upload.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{upload.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            About GEDCOM Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">What is GEDCOM?</h3>
              <p className="text-sm text-muted-foreground">
                GEDCOM (GEnealogical Data COMmunication) is a standard file format for exchanging genealogical data
                between different genealogy software programs. It contains information about individuals, families,
                relationships, and events.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">What can GEDCOM contain?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Family relationships and pedigrees</li>
                <li>• Birth, marriage, and death records</li>
                <li>• References to photos and documents</li>
                <li>• Notes and sources</li>
                <li>• Multiple languages and character sets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
