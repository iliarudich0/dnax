"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listUploads, getTraitResults, createShare, listShares, updateShare } from "@/lib/data";
import { TraitResult, UploadRecord, ShareRecord } from "@/lib/types";
import { buildShareHeadline, buildShareNote, selectTopTraits } from "@/lib/report";
import { getStoredReferral } from "@/components/referrer-tracker";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [traits, setTraits] = useState<TraitResult[]>([]);
  const [share, setShare] = useState<ShareRecord | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const list = await listUploads(user.id);
      setUploads(list);
      if (list[0]) {
        const results = await getTraitResults(user.id, list[0].id);
        setTraits(results);
      }
      const shares = await listShares(user.id);
      setShare(shares[0] ?? null);
    };
    load();
  }, [user]);

  const latest = uploads[0];
  const traitsGenerated = traits.filter((trait) => trait.outcome !== "Not detected").length;

  const shareUrl = useMemo(() => {
    if (!share) return null;
    if (typeof window === "undefined") return null;
    const referral = getStoredReferral();
    const url = new URL(`/share`, window.location.origin);
    url.searchParams.set("id", share.id);
    if (referral) url.searchParams.set("ref", referral);
    return url.toString();
  }, [share]);

  const handleToggleShare = async () => {
    if (!user || !latest) return;
    if (share && share.enabled) {
      await updateShare(share.id, { enabled: false });
      setShare({ ...share, enabled: false });
      return;
    }

    const topTraits = selectTopTraits(traits, 5).map((trait) => ({
      traitId: trait.traitId,
      name: trait.name,
      category: trait.category,
      outcome: trait.outcome,
    }));

    if (share) {
      await updateShare(share.id, {
        enabled: true,
        topTraits,
        headline: buildShareHeadline(traits),
        note: buildShareNote(),
      });
      setShare({ ...share, enabled: true, topTraits });
      return;
    }

    const created = await createShare({
      userId: user.id,
      uploadId: latest.id,
      enabled: true,
      topTraits,
      headline: buildShareHeadline(traits),
      note: buildShareNote(),
    });
    setShare(created);
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopyStatus("Link copied");
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Your DNA traits overview</p>
        </div>
        <Badge variant="secondary">{uploads.length} uploads</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-white/90">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Uploads</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{uploads.length}</CardContent>
        </Card>
        <Card className="border-border/70 bg-white/90">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Traits generated</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{traitsGenerated}</CardContent>
        </Card>
        <Card className="border-border/70 bg-white/90">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Last processed</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {latest?.processedAt ? new Date(latest.processedAt).toLocaleString() : "Not processed yet"}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-white/90">
        <CardHeader>
          <CardTitle>Share a public summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Share your top traits without exposing raw DNA or genotypes.</p>
            <p>Sharing is disabled by default.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={handleToggleShare} disabled={!latest}>
              <Share2 className="h-4 w-4" />
              {share?.enabled ? "Disable share" : "Enable share"}
            </Button>
            <Button variant="outline" onClick={handleCopy} disabled={!share?.enabled || !shareUrl}>
              <Copy className="h-4 w-4" />
              {copyStatus ?? "Copy link"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
