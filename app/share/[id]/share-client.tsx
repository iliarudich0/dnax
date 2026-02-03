"use client";

import { useEffect, useState } from "react";
import { Copy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { useAuth, type AppUpload } from "@/components/providers/auth-provider";
import { withBasePath } from "@/lib/urls";
import { toast } from "sonner";

type ShareClientProps = {
  id: string;
};

export default function ShareClient({ id }: ShareClientProps) {
  const { copy } = useLocale();
  const { getUpload } = useAuth();
  const [upload, setUpload] = useState<AppUpload | null>(null);

  useEffect(() => {
    getUpload(id)
      .then(setUpload)
      .catch(() => setUpload(null));
  }, [getUpload, id]);

  const handleCopy = () => {
    const link = `${window.location.origin}${withBasePath(`/share/${id}`)}`;
    navigator.clipboard.writeText(link);
    toast.success(copy.toasts.copied);
  };

  if (!upload) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">{copy.share.notFound}</p>
          <Link href="/">
            <Button variant="secondary">
              <ArrowLeft className="mr-2 h-4 w-4" /> {copy.hero.primaryCta}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isImage = upload.type.startsWith("image");

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <Card className="border border-border/70 bg-white/80">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{copy.share.title}</CardTitle>
              <CardDescription>{upload.name}</CardDescription>
            </div>
            <Button size="sm" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" /> {copy.share.copy}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isImage ? (
              <div className="overflow-hidden rounded-3xl border border-border/70">
                <Image
                  src={upload.url}
                  alt={upload.name}
                  width={1200}
                  height={800}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                <p>{upload.type}</p>
                <p>{Math.round(upload.size / 1024)} KB</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">{upload.description || copy.demo.desc}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}