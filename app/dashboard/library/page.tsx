"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, Trash2, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, type AppUpload } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { Separator } from "@/components/ui/separator";
import { withBasePath } from "@/lib/urls";
import { toast } from "sonner";

export default function LibraryPage() {
  const { listUploads, deleteUpload } = useAuth();
  const { copy } = useLocale();
  const [uploads, setUploads] = useState<AppUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUploads()
      .then(setUploads)
      .finally(() => setLoading(false));
  }, [listUploads]);

  const handleDelete = async (id: string) => {
    const ok = await deleteUpload(id);
    if (ok) {
      setUploads((prev) => prev.filter((item) => item.id !== id));
      toast.success(copy.toasts.deleted);
    }
  };

  const handleCopy = (id: string) => {
    const link = `${window.location.origin}${withBasePath(`/share/${id}`)}`;
    navigator.clipboard.writeText(link);
    toast.success(copy.toasts.copied);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-700">{copy.dashboard.library.title}</p>
        <p className="text-sm text-muted-foreground">{copy.dashboard.uploads.subtitle}</p>
      </div>
      {loading && <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />}
      {!loading && uploads.length === 0 && (
        <Card className="border border-border/70 bg-white/80">
          <CardHeader>
            <CardTitle>{copy.dashboard.library.empty}</CardTitle>
          </CardHeader>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {uploads.map((file) => (
          <Card key={file.id} className="border border-border/70 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{file.name}</span>
                <span className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</span>
              </CardTitle>
              <CardDescription>{format(new Date(file.createdAt), "PPP p")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{file.description || "Brak opisu"}</p>
              <Separator />
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleCopy(file.id)}>
                  <Copy className="mr-2 h-4 w-4" /> {copy.share.copy}
                </Button>
                <Link href={`/share/${file.id}`} className="flex-1">
                  <Button size="sm" variant="ghost" className="w-full justify-center">
                    <ExternalLink className="mr-2 h-4 w-4" /> /share/{file.id}
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(file.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
