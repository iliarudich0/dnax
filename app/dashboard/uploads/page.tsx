"use client";

import { useEffect, useMemo, useState } from "react";
import { UploadCloud, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES } from "@/lib/constants";
import { parseRawFile, toNormalizedData } from "@/lib/parser";
import { evaluateTraits, traitSnpIds } from "@/lib/traits/catalog";
import { createUpload, deleteRawFile, deleteUpload, getSettings, listUploads, saveNormalizedData, saveRawFile, saveTraitResults, updateUpload } from "@/lib/data";
import { getOrCreateLocalKey } from "@/lib/encryption";
import { UploadRecord } from "@/lib/types";

export default function UploadsPage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [settingsRetention, setSettingsRetention] = useState(7);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);

  const allowedLabel = useMemo(() => ALLOWED_EXTENSIONS.join(", "), []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [data, settings] = await Promise.all([listUploads(user.id), getSettings(user.id)]);
      setUploads(data);
      if (settings?.retentionDays) setSettingsRetention(settings.retentionDays);
      if (settings?.encryptionEnabled !== undefined) setEncryptionEnabled(settings.encryptionEnabled);
    };
    load();
  }, [user]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setError(null);

    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError(`Unsupported file type. Allowed: ${allowedLabel}`);
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setError("File too large. Please upload a file under 25MB.");
      return;
    }

    setProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      const parsed = parseRawFile(text);

      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + settingsRetention * 24 * 60 * 60 * 1000).toISOString();

      const upload = await createUpload(user.id, {
        fileName: file.name,
        provider: parsed.provider,
        size: file.size,
        createdAt: createdAt.toISOString(),
        status: "processing",
        summary: {
          totalSnps: parsed.summary.totalLines,
          parsedSnps: parsed.summary.parsedSnps,
          chromosomes: parsed.summary.chromosomes,
        },
        rawExpiresAt: expiresAt,
      });

      const normalized = toNormalizedData(upload.id, parsed);
      const filteredSnps = normalized.snps.filter((snp) => traitSnpIds.includes(snp.rsid));
      const filteredMap: Record<string, string> = {};
      traitSnpIds.forEach((id) => {
        filteredMap[id] = normalized.genotypeMap[id] ?? "--";
      });

      const traits = evaluateTraits(normalized.genotypeMap);
      const key = encryptionEnabled ? await getOrCreateLocalKey() : undefined;

      await Promise.all([
        saveRawFile(user.id, upload.id, buffer, encryptionEnabled, key ?? undefined, expiresAt),
        saveNormalizedData(user.id, upload.id, {
          ...normalized,
          snps: filteredSnps,
          genotypeMap: filteredMap,
        }),
        saveTraitResults(user.id, upload.id, traits),
      ]);

      await updateUpload(user.id, upload.id, {
        status: "ready",
        processedAt: new Date().toISOString(),
      });

      const refreshed = await listUploads(user.id);
      setUploads(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (uploadId: string) => {
    if (!user) return;
    await deleteUpload(user.id, uploadId);
    await deleteRawFile(user.id, uploadId);
    const refreshed = await listUploads(user.id);
    setUploads(refreshed);
  };

  return (
    <div className="grid gap-6">
      <Card className="border-border/70 bg-white/90">
        <CardHeader>
          <CardTitle>Upload raw DNA</CardTitle>
          <CardDescription>Supported formats: 23andMe, AncestryDNA, MyHeritage ({allowedLabel}).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Input
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
            }}
            disabled={processing}
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <UploadCloud className="h-4 w-4" /> Files are private and auto-deleted after {settingsRetention} days.
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Uploads</h2>
          <Badge variant="secondary">{uploads.length}</Badge>
        </div>
        {uploads.length === 0 ? (
          <Card className="border-border/70 bg-white/90">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No uploads yet. Upload a raw DNA file to generate traits.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {uploads.map((upload) => (
              <Card key={upload.id} className="border-border/70 bg-white/90">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-semibold">{upload.fileName}</p>
                    <p className="text-xs text-muted-foreground">{upload.provider}</p>
                    <p className="text-xs text-muted-foreground">
                      Parsed {upload.summary.parsedSnps} SNPs ? Status {upload.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {upload.rawExpiresAt ? `Raw expires ${new Date(upload.rawExpiresAt).toLocaleDateString()}` : "Retention not set"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(upload.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
