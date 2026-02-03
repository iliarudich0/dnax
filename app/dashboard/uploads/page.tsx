"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/components/providers/locale-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";

export default function UploadsPage() {
  const { copy } = useLocale();
  const { uploadFile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const fileInput = useRef<HTMLInputElement | null>(null);

  const handleUpload = async () => {
    const file = fileInput.current?.files?.[0];
    if (!file) {
      toast.error("Wybierz plik");
      return;
    }
    try {
      setLoading(true);
      await uploadFile(file, description);
      toast.success(copy.toasts.uploaded);
      if (fileInput.current) fileInput.current.value = "";
      setDescription("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd uploadu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-700">{copy.dashboard.uploads.title}</p>
        <p className="text-sm text-muted-foreground">{copy.dashboard.uploads.subtitle}</p>
      </div>
      <Card className="border border-border/70 bg-white/80">
        <CardHeader>
          <CardTitle>{copy.dashboard.uploads.helper}</CardTitle>
          <CardDescription>{copy.dashboard.uploads.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" ref={fileInput} />
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={copy.dashboard.uploads.description}
          />
          <Button onClick={handleUpload} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {copy.dashboard.uploads.upload}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
